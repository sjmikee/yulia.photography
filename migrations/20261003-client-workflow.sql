-- Run once in the Neon SQL Editor for the database/branch used by the app.
BEGIN;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS workflow jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS session_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id integer NOT NULL REFERENCES sessions(id),
  stage text NOT NULL CHECK (stage IN ('deposit', 'balance')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_on date NOT NULL,
  receipt_status text NOT NULL DEFAULT 'pending' CHECK (receipt_status IN ('pending', 'processing', 'issued')),
  receipt_id text,
  receipt_number text,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, stage)
);
CREATE INDEX IF NOT EXISTS sessions_client_workflow_idx ON sessions(client_id, id DESC);
COMMIT;
-- Existing balances and signatures are preserved. Historical payments are not inferred.
