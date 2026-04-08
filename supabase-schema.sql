-- ============================================================
-- LEAVE MANAGEMENT APP - SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- EMPLOYEES TABLE
-- EL has no separate allocation — it deducts from al_balance
-- ============================================================
CREATE TABLE employees (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  department   TEXT NOT NULL,
  position     TEXT NOT NULL,
  al_balance   NUMERIC(5,1) DEFAULT 14,  -- Annual Leave (also covers EL)
  mc_balance   NUMERIC(5,1) DEFAULT 14,  -- Medical Leave
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEAVE REQUESTS TABLE
-- leave_type: AL | EL | MC | Others
-- EL is recorded as EL but balance is deducted from al_balance
-- ============================================================
CREATE TABLE leave_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type   TEXT NOT NULL CHECK (leave_type IN ('AL', 'EL', 'MC', 'Others')),
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  days_count   NUMERIC(4,1) NOT NULL,
  reason       TEXT,
  status       TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  admin_note   TEXT,
  attachment_url TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN TABLE (single admin account)
-- ============================================================
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status   ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates    ON leave_requests(start_date, end_date);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE employees     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees readable"       ON employees      FOR SELECT USING (true);
CREATE POLICY "Leave requests readable"  ON leave_requests FOR SELECT USING (true);
CREATE POLICY "Leave requests insertable" ON leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Leave requests updatable" ON leave_requests FOR UPDATE USING (true);
CREATE POLICY "Admin users readable"     ON admin_users    FOR SELECT USING (true);

-- ============================================================
-- SAMPLE DATA
-- ============================================================
INSERT INTO employees (name, email, department, position, al_balance, mc_balance) VALUES
  ('Ahmad Razif',       'ahmad.razif@company.com',  'Engineering', 'Senior Developer', 12, 10),
  ('Nurul Aina',        'nurul.aina@company.com',   'Marketing',   'Marketing Executive', 14, 14),
  ('Chong Wei Lim',     'chong.wei@company.com',    'Finance',     'Finance Manager', 10, 8),
  ('Priya Subramaniam', 'priya.s@company.com',      'HR',          'HR Executive', 14, 12),
  ('Faiz Harun',        'faiz.harun@company.com',   'Engineering', 'Junior Developer', 14, 14);

-- ⚠ Replace with your actual admin email
INSERT INTO admin_users (email) VALUES ('admin@company.com');

-- ============================================================
-- MIGRATION (if upgrading from old schema with el_balance)
-- Run this ONLY if you have an existing table with el_balance:
-- ============================================================
-- ALTER TABLE employees DROP COLUMN IF EXISTS el_balance;
