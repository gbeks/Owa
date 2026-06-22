import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase', () => ({
  logSearch: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks are in place
const { GET } = await import('@/app/api/find-route/route');

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/find-route');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/find-route', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('missing params', () => {
    it('returns 400 when both params are missing', async () => {
      const res = await GET(makeRequest({}));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it('returns 400 when only "from" is provided', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba' }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when only "to" is provided', async () => {
      const res = await GET(makeRequest({ to: 'cms-lagos-island' }));
      expect(res.status).toBe(400);
    });
  });

  describe('single known route', () => {
    it('returns 200 with a routes array', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'cms-lagos-island' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.routes)).toBe(true);
      expect(body.routes.length).toBe(1);
    });

    it('route has resolved legs (not raw segments)', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'cms-lagos-island' }));
      const { routes } = await res.json();
      expect(routes[0].legs).toBeDefined();
      expect(routes[0]).not.toHaveProperty('segments');
    });

    it('route carries correct fare and duration', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'cms-lagos-island' }));
      const { routes } = await res.json();
      expect(routes[0].total_fare_min).toBeGreaterThanOrEqual(0);
      expect(routes[0].total_fare_max).toBeGreaterThanOrEqual(routes[0].total_fare_min);
      expect(routes[0].total_duration_estimate_mins).toBeGreaterThan(0);
    });
  });

  describe('multiple routes for one pair', () => {
    it('returns all routes for jakande-gate → ikeja-under-bridge', async () => {
      const res = await GET(makeRequest({ from: 'jakande-gate', to: 'ikeja-under-bridge' }));
      expect(res.status).toBe(200);
      const { routes } = await res.json();
      expect(routes.length).toBe(2);
    });
  });

  describe('parent destination expansion (Ikeja)', () => {
    it('returns expanded:true with items array', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'ikeja' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.expanded).toBe(true);
      expect(body.parent_label).toBe('Ikeja');
      expect(Array.isArray(body.items)).toBe(true);
    });

    it('items cover all three Ikeja sub-destinations', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'ikeja' }));
      const { items } = await res.json();
      const ids = items.map((i: { destination_id: string }) => i.destination_id);
      expect(ids).toContain('ikeja-under-bridge');
      expect(ids).toContain('ikeja-along');
      expect(ids).toContain('computer-village');
    });

    it('each item has a destination_label and routes array', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'ikeja' }));
      const { items } = await res.json();
      items.forEach((item: { destination_label: string; routes: unknown[] }) => {
        expect(typeof item.destination_label).toBe('string');
        expect(Array.isArray(item.routes)).toBe(true);
      });
    });
  });

  describe('parent destination expansion (Mushin)', () => {
    it('returns expanded:true for mushin with idi-araba and luth', async () => {
      const res = await GET(makeRequest({ from: 'ojuelegba', to: 'mushin' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.expanded).toBe(true);
      const ids = body.items.map((i: { destination_id: string }) => i.destination_id);
      expect(ids).toContain('idi-araba');
      expect(ids).toContain('luth');
    });
  });

  describe('route not found', () => {
    it('returns 404 for an unknown origin/destination pair', async () => {
      const res = await GET(makeRequest({ from: 'nowhere', to: 'also-nowhere' }));
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });
});
