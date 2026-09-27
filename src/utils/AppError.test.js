import { describe, it, expect } from 'vitest';
import { AppError } from './AppError.js';

describe('AppError', () => {
  it('sets statusCode and message', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
  });
});
