/**
 * Middleware Unit Tests
 */

const jwt = require('jsonwebtoken');

// Set env before requiring middleware
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.MONGODB_URI = 'mongodb://localhost/test';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: { readyState: 1, close: jest.fn() },
  Schema: jest.requireActual('mongoose').Schema,
  model: jest.requireActual('mongoose').model,
}));

// Mock User model
jest.mock('../models/User', () => {
  const MockUser = jest.fn();
  MockUser.findById = jest.fn();
  return MockUser;
});

// Mock Note model
jest.mock('../models/Note', () => {
  const MockNote = jest.fn();
  MockNote.findById = jest.fn();
  return MockNote;
});

const { authMiddleware, optionalAuth, checkNoteAccess } = require('../middleware/auth');
const User = require('../models/User');
const Note = require('../models/Note');

// Helper: build mock req/res/next
const mockReqRes = (overrides = {}) => {
  const req = { headers: {}, params: {}, user: null, ...overrides };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('authMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no Authorization header', async () => {
    const { req, res, next } = mockReqRes();
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is malformed', async () => {
    const { req, res, next } = mockReqRes({
      headers: { authorization: 'Bearer not.a.valid.token' },
    });
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when user no longer exists', async () => {
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
    });
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next() and sets req.user when token is valid', async () => {
    const mockUser = { _id: 'user123', name: 'Alice', email: 'alice@example.com' };
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
    });
    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(mockUser);
  });
});

describe('optionalAuth', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls next() without setting user when no token', async () => {
    const { req, res, next } = mockReqRes();
    await optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeNull();
  });

  it('sets req.user when valid token provided', async () => {
    const mockUser = { _id: 'user123', name: 'Alice' };
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const { req, res, next } = mockReqRes({
      headers: { authorization: `Bearer ${token}` },
    });
    await optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(mockUser);
  });

  it('still calls next() when token is invalid (silent fail)', async () => {
    const { req, res, next } = mockReqRes({
      headers: { authorization: 'Bearer invalid-token' },
    });
    await optionalAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeNull();
  });
});

describe('checkNoteAccess', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 404 when note does not exist', async () => {
    Note.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const { req, res, next } = mockReqRes({ params: { id: 'note123' } });
    await checkNoteAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 on invalid ObjectId (CastError)', async () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';
    Note.findById.mockReturnValue({
      populate: jest.fn().mockRejectedValue(err),
    });
    const { req, res, next } = mockReqRes({ params: { id: 'bad-id' } });
    await checkNoteAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('allows access to public notes without auth', async () => {
    const mockNote = {
      _id: 'note123',
      visibility: 'public',
      userId: { _id: 'owner456', toString: () => 'owner456' },
      sharedWith: [],
      bookmarkedBy: [],
      viewCount: 0,
      save: jest.fn(),
    };
    Note.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockNote) });
    const { req, res, next } = mockReqRes({ params: { id: 'note123' }, user: null });
    await checkNoteAccess(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.isOwner).toBe(false);
  });

  it('returns 403 for private note accessed by non-owner', async () => {
    const mockNote = {
      _id: 'note123',
      visibility: 'private',
      userId: { _id: 'owner456', toString: () => 'owner456' },
      sharedWith: [],
    };
    Note.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockNote) });
    const { req, res, next } = mockReqRes({
      params: { id: 'note123' },
      user: { _id: { toString: () => 'stranger789' } },
    });
    await checkNoteAccess(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows owner to access private note', async () => {
    const mockNote = {
      _id: 'note123',
      visibility: 'private',
      userId: { _id: 'owner456', toString: () => 'owner456' },
      sharedWith: [],
    };
    Note.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockNote) });
    const { req, res, next } = mockReqRes({
      params: { id: 'note123' },
      user: { _id: { toString: () => 'owner456' } },
    });
    await checkNoteAccess(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.isOwner).toBe(true);
  });
});
