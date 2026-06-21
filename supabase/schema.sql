-- Owa — Lagos Transit Router
-- Run this in your Supabase SQL Editor.

-- ============================================================
-- search_logs: every search tap, no PII, powers popular chips
-- ============================================================
CREATE TABLE IF NOT EXISTS search_logs (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  origin       TEXT        NOT NULL,
  destination  TEXT        NOT NULL,
  result_found BOOLEAN     NOT NULL,
  searched_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_pair
  ON search_logs(origin, destination, searched_at DESC);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_search_logs"
  ON search_logs FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "auth_select_search_logs"
  ON search_logs FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- route_submissions: corrections + new route contributions
-- ============================================================
CREATE TABLE IF NOT EXISTS route_submissions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type              TEXT        NOT NULL,
  CONSTRAINT type_check CHECK (type IN ('correction', 'new_route')),
  route_id          TEXT,
  origin            TEXT,
  destination       TEXT,
  description       TEXT        NOT NULL,
  submitter_contact TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending',
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at      TIMESTAMPTZ DEFAULT now(),
  reviewed_at       TIMESTAMPTZ,
  reviewer_notes    TEXT
);

CREATE INDEX IF NOT EXISTS idx_route_submissions_pending
  ON route_submissions(status, submitted_at DESC)
  WHERE status = 'pending';

ALTER TABLE route_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_submissions"
  ON route_submissions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "auth_select_submissions"
  ON route_submissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_update_submissions"
  ON route_submissions FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- Weekly popular routes view (used to rank route chips)
-- ============================================================
CREATE OR REPLACE VIEW popular_routes_weekly AS
SELECT
  origin,
  destination,
  COUNT(*) AS search_count
FROM search_logs
WHERE searched_at > now() - interval '7 days'
  AND result_found = true
GROUP BY origin, destination
ORDER BY search_count DESC;
