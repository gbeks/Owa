import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  submitContribution: vi.fn().mockResolvedValue({ success: true }),
}));

const { POST } = await import('@/app/api/contribute/route');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contribute', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('type validation', () => {
    it('returns 400 when type is missing', async () => {
      const res = await POST(makeRequest({ description: 'Some valid description text.' }));
      expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid type', async () => {
      const res = await POST(makeRequest({ type: 'spam', description: 'A valid description here.' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid type/i);
    });
  });

  describe('description validation', () => {
    it('returns 400 when description is missing', async () => {
      const res = await POST(makeRequest({ type: 'correction', route_id: 'ojuelegba-to-cms' }));
      expect(res.status).toBe(400);
    });

    it('returns 400 when description is shorter than 10 characters', async () => {
      const res = await POST(makeRequest({ type: 'correction', route_id: 'r', description: 'short' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/10 characters/i);
    });

    it('returns 400 for a description that is exactly 9 characters', async () => {
      const res = await POST(makeRequest({ type: 'correction', route_id: 'r', description: '123456789' }));
      expect(res.status).toBe(400);
    });

    it('accepts a description that is exactly 10 characters', async () => {
      const res = await POST(makeRequest({ type: 'correction', route_id: 'r', description: '1234567890' }));
      expect(res.status).toBe(200);
    });
  });

  describe('new_route submissions', () => {
    it('returns 400 when origin is missing for new_route', async () => {
      const res = await POST(makeRequest({
        type: 'new_route',
        destination: 'Ketu',
        description: 'A detailed description of this new route.',
      }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/origin and destination/i);
    });

    it('returns 400 when destination is missing for new_route', async () => {
      const res = await POST(makeRequest({
        type: 'new_route',
        origin: 'Yaba',
        description: 'A detailed description of this new route.',
      }));
      expect(res.status).toBe(400);
    });

    it('returns 200 for a valid new_route submission', async () => {
      const res = await POST(makeRequest({
        type: 'new_route',
        origin: 'Yaba',
        destination: 'Ketu',
        description: 'Board a danfo at Yaba heading to Ketu, drop at Ketu Bus Stop.',
      }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe('correction submissions', () => {
    it('returns 200 for a valid correction submission', async () => {
      const res = await POST(makeRequest({
        type: 'correction',
        route_id: 'ojuelegba-to-cms',
        description: 'The fare has increased to ₦500 since last month.',
      }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('trims whitespace from description before saving', async () => {
      const { submitContribution } = await import('@/lib/supabase');
      await POST(makeRequest({
        type: 'correction',
        route_id: 'r',
        description: '  Fare has changed.  ',
      }));
      expect(submitContribution).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Fare has changed.' })
      );
    });

    it('passes submitter_contact through when provided', async () => {
      const { submitContribution } = await import('@/lib/supabase');
      await POST(makeRequest({
        type: 'correction',
        route_id: 'r',
        description: 'Boarding point has changed.',
        submitter_contact: 'user@example.com',
      }));
      expect(submitContribution).toHaveBeenCalledWith(
        expect.objectContaining({ submitter_contact: 'user@example.com' })
      );
    });
  });

  describe('supabase failure', () => {
    it('returns 500 when submitContribution reports failure', async () => {
      const { submitContribution } = await import('@/lib/supabase');
      vi.mocked(submitContribution).mockResolvedValueOnce({ success: false, error: 'DB error' });

      const res = await POST(makeRequest({
        type: 'correction',
        route_id: 'r',
        description: 'Something went wrong on our end.',
      }));
      expect(res.status).toBe(500);
    });
  });

  describe('malformed request', () => {
    it('returns 400 for a non-JSON body', async () => {
      const req = new Request('http://localhost/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'not json',
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
