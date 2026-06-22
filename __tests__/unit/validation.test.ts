import { describe, it, expect } from 'vitest';
import { correctionSchema, searchSchema, routeQuerySchema } from '@/lib/validation';

describe('correctionSchema', () => {
  it('accepts a minimal valid correction', () => {
    const result = correctionSchema.safeParse({
      route_id: 'ojuelegba-to-cms',
      issue_type: 'wrong_fare',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = correctionSchema.safeParse({
      route_id: 'ojuelegba-to-cms',
      leg_id: 'leg-01',
      issue_type: 'wrong_landmark',
      description: 'The boarding point has moved to the new terminal.',
    });
    expect(result.success).toBe(true);
  });

  it('accepts every valid issue_type', () => {
    const validTypes = ['wrong_landmark', 'wrong_fare', 'route_closed', 'wrong_vehicle', 'other'];
    validTypes.forEach((issue_type) => {
      const result = correctionSchema.safeParse({ route_id: 'r', issue_type });
      expect(result.success, `issue_type "${issue_type}" should be valid`).toBe(true);
    });
  });

  it('rejects an invalid issue_type', () => {
    const result = correctionSchema.safeParse({
      route_id: 'ojuelegba-to-cms',
      issue_type: 'bad_type',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing route_id', () => {
    const result = correctionSchema.safeParse({ issue_type: 'wrong_fare' });
    expect(result.success).toBe(false);
  });

  it('rejects missing issue_type', () => {
    const result = correctionSchema.safeParse({ route_id: 'ojuelegba-to-cms' });
    expect(result.success).toBe(false);
  });

  it('rejects empty route_id', () => {
    const result = correctionSchema.safeParse({ route_id: '', issue_type: 'other' });
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 500 characters', () => {
    const result = correctionSchema.safeParse({
      route_id: 'r',
      issue_type: 'other',
      description: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('searchSchema', () => {
  it('accepts a valid query', () => {
    const result = searchSchema.safeParse({ q: 'Yaba' });
    expect(result.success).toBe(true);
  });

  it('rejects query shorter than 2 characters', () => {
    const result = searchSchema.safeParse({ q: 'Y' });
    expect(result.success).toBe(false);
  });

  it('rejects query longer than 100 characters', () => {
    const result = searchSchema.safeParse({ q: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('coerces limit from a string to a number', () => {
    const result = searchSchema.safeParse({ q: 'Yaba', limit: '5' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(5);
  });

  it('defaults limit to 8 when omitted', () => {
    const result = searchSchema.safeParse({ q: 'Yaba' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(8);
  });

  it('rejects limit below 1', () => {
    const result = searchSchema.safeParse({ q: 'Yaba', limit: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit above 20', () => {
    const result = searchSchema.safeParse({ q: 'Yaba', limit: 21 });
    expect(result.success).toBe(false);
  });
});

describe('routeQuerySchema', () => {
  it('accepts valid from and to', () => {
    const result = routeQuerySchema.safeParse({ from: 'ojuelegba', to: 'cms-lagos-island' });
    expect(result.success).toBe(true);
  });

  it('rejects missing from', () => {
    const result = routeQuerySchema.safeParse({ to: 'cms-lagos-island' });
    expect(result.success).toBe(false);
  });

  it('rejects missing to', () => {
    const result = routeQuerySchema.safeParse({ from: 'ojuelegba' });
    expect(result.success).toBe(false);
  });

  it('rejects empty strings', () => {
    const result = routeQuerySchema.safeParse({ from: '', to: 'cms-lagos-island' });
    expect(result.success).toBe(false);
  });
});
