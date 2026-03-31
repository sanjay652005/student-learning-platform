/**
 * Auth Routes — Integration Tests
 * Run: npm test
 * Requires: MONGODB_URI in .env.test or uses in-memory mock
 */

const request = require('supertest');

// We mock mongoose and models to avoid needing a real DB in CI
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),
    connection: { readyState: 1, close: jest.fn() },
    Schema: actual.Schema,
    model: actual.model,
  };
});

// Mock User model
jest.mock('../models/User', () => {
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    aiUsage: { chatCount: 0, quizCount: 0, lastReset: new Date() },
    createdAt: new Date(),
    comparePassword: jest.fn(),
    resetDailyUsageIfNeeded: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
  };

  const MockUser = jest.fn().mockImplementation((data) => ({
    ...mockUser,
    ...data,
    save: jest.fn().mockResolvedValue({ ...mockUser, ...data }),
  }));
  MockUser.findOne = jest.fn();
  MockUser.findById = jest.fn();
  MockUser.create = jest.fn();
  return MockUser;
});

const app = require('../server');
const User = require('../models/User');

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  it('returns 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  it('returns 400 if password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  it('returns 409 if email already registered', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing', email: 'taken@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'taken@example.com', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already/i);
  });

  it('returns 201 with token on valid registration', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'newuser123',
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: new Date(),
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@example.com');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 if email missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 if password missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 401 if user not found', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns 401 if password is wrong', async () => {
    const mockUser = {
      _id: 'user1',
      email: 'test@example.com',
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('returns 200 with token on valid credentials', async () => {
    const mockUser = {
      _id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      aiUsage: { chatCount: 0, quizCount: 0, lastReset: new Date() },
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });
});

describe('GET /api/health', () => {
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Unknown routes', () => {
  it('returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
