-- Run this in your Supabase SQL Editor to set up the corrections table.

CREATE TABLE IF NOT EXISTS corrections (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ   DEFAULT NOW() NOT NULL,

  route_id      TEXT          NOT NULL,
  leg_id        TEXT,

  issue_type    TEXT          NOT NULL,
  CONSTRAINT issue_type_check CHECK (
    issue_type IN (
      'wrong_landmark',
      'wrong_fare',
      'route_closed',
      'wrong_vehicle',
      'other'
    )
  ),

  description   TEXT          CHECK (char_length(description) <= 500),

  status        TEXT          NOT NULL DEFAULT 'pending',
  CONSTRAINT status_check CHECK (
    status IN ('pending', 'reviewed', 'applied', 'dismissed')
  ),

  user_agent    TEXT,
  ip_hash       TEXT
);

-- Indexes
CREATE INDEX idx_corrections_review
  ON corrections(status, created_at DESC)
  WHERE status = 'pending';

CREATE INDEX idx_corrections_route_id
  ON corrections(route_id, created_at DESC);

-- Row Level Security
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert"
  ON corrections FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "auth_select"
  ON corrections FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_update_status"
  ON corrections FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);
