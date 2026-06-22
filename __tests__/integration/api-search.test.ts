import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

const { GET } = await import('@/app/api/search/route');

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/search');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/search', () => {
  describe('validation', () => {
    it('returns 400 when q is missing', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.code).toBe('QUERY_TOO_SHORT');
    });

    it('returns 400 when q is a single character', async () => {
      const res = await GET(makeRequest({ q: 'Y' }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when q is an empty string', async () => {
      const res = await GET(makeRequest({ q: '' }));
      expect(res.status).toBe(400);
    });
  });

  describe('successful searches', () => {
    it('returns 200 with results, query and total', async () => {
      const res = await GET(makeRequest({ q: 'Yaba' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.query).toBe('Yaba');
      expect(Array.isArray(body.results)).toBe(true);
      expect(typeof body.total).toBe('number');
      expect(body.total).toBe(body.results.length);
    });

    it('finds Ojuelegba by partial name', async () => {
      const res = await GET(makeRequest({ q: 'ojue' }));
      const { results } = await res.json();
      expect(results.some((r: { location_id: string }) => r.location_id === 'ojuelegba')).toBe(true);
    });

    it('finds Victoria Island by alias "VI"', async () => {
      const res = await GET(makeRequest({ q: 'VI' }));
      const { results } = await res.json();
      expect(results.some((r: { location_id: string }) => r.location_id === 'victoria-island')).toBe(true);
    });

    it('finds LUTH by name', async () => {
      const res = await GET(makeRequest({ q: 'LUTH' }));
      const { results } = await res.json();
      expect(results.some((r: { location_id: string }) => r.location_id === 'luth')).toBe(true);
    });

    it('respects the limit parameter', async () => {
      const res = await GET(makeRequest({ q: 'bus', limit: '2' }));
      const { results } = await res.json();
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('caps limit at 20', async () => {
      const res = await GET(makeRequest({ q: 'Lagos', limit: '99' }));
      const { results } = await res.json();
      expect(results.length).toBeLessThanOrEqual(20);
    });

    it('returns 200 with empty results for a query with no matches', async () => {
      const res = await GET(makeRequest({ q: 'xyznonexistent999' }));
      expect(res.status).toBe(200);
      const { results, total } = await res.json();
      expect(results).toHaveLength(0);
      expect(total).toBe(0);
    });

    it('includes Cache-Control header on successful response', async () => {
      const res = await GET(makeRequest({ q: 'Yaba' }));
      expect(res.headers.get('Cache-Control')).toContain('max-age=300');
    });

    it('each result has required location fields', async () => {
      const res = await GET(makeRequest({ q: 'Oshodi' }));
      const { results } = await res.json();
      expect(results.length).toBeGreaterThan(0);
      results.forEach((loc: Record<string, unknown>) => {
        expect(loc).toHaveProperty('location_id');
        expect(loc).toHaveProperty('canonical_name');
        expect(loc).toHaveProperty('aliases');
        expect(loc).toHaveProperty('type');
      });
    });
  });
});
