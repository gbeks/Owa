import { describe, it, expect } from 'vitest';
import { searchLocations } from '@/lib/search';

describe('searchLocations', () => {
  it('returns empty array for query shorter than 2 characters', () => {
    expect(searchLocations('')).toHaveLength(0);
    expect(searchLocations('Y')).toHaveLength(0);
  });

  it('finds a location by exact canonical name', () => {
    const results = searchLocations('Yaba');
    expect(results[0]?.location_id).toBe('yaba');
  });

  it('finds a location by partial canonical name', () => {
    const results = searchLocations('ojue');
    expect(results.some((r) => r.location_id === 'ojuelegba')).toBe(true);
  });

  it('finds a location by alias', () => {
    const results = searchLocations('VI');
    expect(results.some((r) => r.location_id === 'victoria-island')).toBe(true);
  });

  it('finds LUTH by its alias', () => {
    const results = searchLocations('LUTH');
    expect(results.some((r) => r.location_id === 'luth')).toBe(true);
  });

  it('finds a location by abbreviated alias', () => {
    const results = searchLocations('CMS');
    expect(results.some((r) => r.location_id === 'cms-lagos-island')).toBe(true);
  });

  it('returns results up to the default limit of 8', () => {
    const results = searchLocations('bus stop');
    expect(results.length).toBeLessThanOrEqual(8);
  });

  it('respects a custom limit', () => {
    const results = searchLocations('Ikeja', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns Location objects with required fields', () => {
    const results = searchLocations('Oshodi');
    expect(results.length).toBeGreaterThan(0);
    const loc = results[0];
    expect(loc).toHaveProperty('location_id');
    expect(loc).toHaveProperty('canonical_name');
    expect(loc).toHaveProperty('aliases');
    expect(loc).toHaveProperty('type');
  });

  it('returns empty array for a query with no matches', () => {
    const results = searchLocations('xyznonexistentplace99');
    expect(results).toHaveLength(0);
  });
});
