import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

// Each test uses a unique key so the in-memory store doesn't bleed between tests.
let keyCounter = 0;
function freshKey() {
  return `test-key-${++keyCounter}`;
}

describe('checkRateLimit', () => {
  it('allows the first request', () => {
    expect(checkRateLimit(freshKey(), 3, 60)).toBe(true);
  });

  it('allows up to maxRequests within the window', () => {
    const key = freshKey();
    expect(checkRateLimit(key, 3, 60)).toBe(true);
    expect(checkRateLimit(key, 3, 60)).toBe(true);
    expect(checkRateLimit(key, 3, 60)).toBe(true);
  });

  it('blocks the request that exceeds maxRequests', () => {
    const key = freshKey();
    checkRateLimit(key, 2, 60);
    checkRateLimit(key, 2, 60);
    expect(checkRateLimit(key, 2, 60)).toBe(false);
  });

  it('continues blocking subsequent requests once the limit is hit', () => {
    const key = freshKey();
    checkRateLimit(key, 1, 60);
    expect(checkRateLimit(key, 1, 60)).toBe(false);
    expect(checkRateLimit(key, 1, 60)).toBe(false);
  });

  it('resets the counter after the window expires', async () => {
    const key = freshKey();
    // Window of 0 seconds expires immediately
    checkRateLimit(key, 1, 0);
    await new Promise((r) => setTimeout(r, 10));
    expect(checkRateLimit(key, 1, 60)).toBe(true);
  });

  it('tracks separate counters for different keys', () => {
    const keyA = freshKey();
    const keyB = freshKey();
    checkRateLimit(keyA, 1, 60);
    // keyA is exhausted, keyB should still be allowed
    expect(checkRateLimit(keyA, 1, 60)).toBe(false);
    expect(checkRateLimit(keyB, 1, 60)).toBe(true);
  });

  it('increments count on each allowed request', () => {
    const key = freshKey();
    expect(checkRateLimit(key, 5, 60)).toBe(true); // count 1
    expect(checkRateLimit(key, 5, 60)).toBe(true); // count 2
    expect(checkRateLimit(key, 5, 60)).toBe(true); // count 3
    expect(checkRateLimit(key, 5, 60)).toBe(true); // count 4
    expect(checkRateLimit(key, 5, 60)).toBe(true); // count 5
    expect(checkRateLimit(key, 5, 60)).toBe(false); // count 6 — blocked
  });
});
