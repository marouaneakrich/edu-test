-- ez_admin_users table
CREATE TABLE IF NOT EXISTS ez_admin_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ez_admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin users
-- Only authenticated admins can read admin users
CREATE POLICY "Allow authenticated to read admin users"
ON ez_admin_users
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated admins can insert admin users
CREATE POLICY "Allow authenticated to insert admin users"
ON ez_admin_users
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update admin users
CREATE POLICY "Allow authenticated to update admin users"
ON ez_admin_users
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Only authenticated admins can delete admin users
CREATE POLICY "Allow authenticated to delete admin users"
ON ez_admin_users
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_ez_admin_users_email ON ez_admin_users(email);
