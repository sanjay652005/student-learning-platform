/**
 * Input Validator Tests
 */

// Mock express-validator to run inline
const { validationResult } = require('express-validator');

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: { readyState: 1 },
  Schema: jest.requireActual('mongoose').Schema,
  model: jest.requireActual('mongoose').model,
}));

const {
  registerValidator,
  loginValidator,
  chatValidator,
  searchValidator,
} = require('../middleware/validators');

// Helper: run validators against a fake req
async function runValidators(validators, body = {}, query = {}, params = {}) {
  const req = {
    body,
    query,
    params,
    headers: {},
    // express-validator needs these:
    _validationErrors: [],
  };

  // The last item in array is `validate` middleware — run all before it
  const chains = validators.slice(0, -1);
  for (const chain of chains) {
    await chain.run(req);
  }
  return validationResult(req);
}

describe('registerValidator', () => {
  it('passes with valid data', async () => {
    const result = await runValidators(registerValidator, {
      name: 'Alice', email: 'alice@example.com', password: 'securepass'
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with missing name', async () => {
    const result = await runValidators(registerValidator, {
      email: 'alice@example.com', password: 'securepass'
    });
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map(e => e.msg);
    expect(msgs.some(m => /name/i.test(m))).toBe(true);
  });

  it('fails with short password', async () => {
    const result = await runValidators(registerValidator, {
      name: 'Alice', email: 'alice@example.com', password: '123'
    });
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map(e => e.msg);
    expect(msgs.some(m => /password/i.test(m))).toBe(true);
  });

  it('fails with invalid email', async () => {
    const result = await runValidators(registerValidator, {
      name: 'Alice', email: 'not-an-email', password: 'securepass'
    });
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map(e => e.msg);
    expect(msgs.some(m => /email/i.test(m))).toBe(true);
  });

  it('fails with name too short', async () => {
    const result = await runValidators(registerValidator, {
      name: 'A', email: 'alice@example.com', password: 'securepass'
    });
    expect(result.isEmpty()).toBe(false);
  });
});

describe('loginValidator', () => {
  it('passes with valid credentials', async () => {
    const result = await runValidators(loginValidator, {
      email: 'alice@example.com', password: 'securepass'
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with missing password', async () => {
    const result = await runValidators(loginValidator, {
      email: 'alice@example.com'
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails with invalid email format', async () => {
    const result = await runValidators(loginValidator, {
      email: 'bad-email', password: 'pass123'
    });
    expect(result.isEmpty()).toBe(false);
  });
});

describe('chatValidator', () => {
  it('passes with valid question', async () => {
    const result = await runValidators(chatValidator, {
      question: 'What is the main topic of this note?'
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with empty question', async () => {
    const result = await runValidators(chatValidator, { question: '' });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails with whitespace-only question', async () => {
    const result = await runValidators(chatValidator, { question: '   ' });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails with question over 1000 chars', async () => {
    const result = await runValidators(chatValidator, {
      question: 'a'.repeat(1001)
    });
    expect(result.isEmpty()).toBe(false);
  });
});

describe('searchValidator', () => {
  it('passes with valid query', async () => {
    const result = await runValidators(searchValidator, {}, { q: 'machine learning' });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with empty query', async () => {
    const result = await runValidators(searchValidator, {}, { q: '' });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails with invalid type', async () => {
    const result = await runValidators(searchValidator, {}, { q: 'test', type: 'invalid' });
    expect(result.isEmpty()).toBe(false);
  });

  it('passes with type=semantic', async () => {
    const result = await runValidators(searchValidator, {}, { q: 'biology', type: 'semantic' });
    expect(result.isEmpty()).toBe(true);
  });
});
