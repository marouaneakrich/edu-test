-- CRM Tables Migration
-- This migration creates tables for the CRM system with proper constraints and RLS policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ez_crm_customers table
CREATE TABLE IF NOT EXISTS ez_crm_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES ez_submissions(id) ON DELETE SET NULL UNIQUE,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  child_name TEXT NOT NULL,
  child_profile TEXT NOT NULL CHECK (child_profile IN ('Enfant typique', 'Enfant Dys', 'Enfant Autiste', 'Enfant TDAH')),
  crm_stage TEXT NOT NULL DEFAULT 'nouveau' CHECK (crm_stage IN ('nouveau', 'contacte', 'qualifie', 'converti')),
  enrollment_date DATE NOT NULL,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique indexes for identity resolution (lowercase)
CREATE UNIQUE INDEX IF NOT EXISTS ez_crm_customers_email_lower_idx ON ez_crm_customers (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS ez_crm_customers_phone_lower_idx ON ez_crm_customers (LOWER(phone));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ez_crm_customers_updated_at BEFORE UPDATE ON ez_crm_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create ez_crm_debt_adjustments table
CREATE TABLE IF NOT EXISTS ez_crm_debt_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES ez_crm_customers(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('reduce', 'clear', 'adjust_expected')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS ez_crm_debt_adjustments_customer_id_idx ON ez_crm_debt_adjustments(customer_id);

-- Create ez_crm_payments table
CREATE TABLE IF NOT EXISTS ez_crm_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES ez_crm_customers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'virement', 'cheque', 'bank')),
  period_covered TEXT NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  certificate_sent BOOLEAN DEFAULT FALSE,
  certificate_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS ez_crm_payments_customer_id_idx ON ez_crm_payments(customer_id);
CREATE INDEX IF NOT EXISTS ez_crm_payments_payment_date_idx ON ez_crm_payments(payment_date);
CREATE INDEX IF NOT EXISTS ez_crm_payments_receipt_number_idx ON ez_crm_payments(receipt_number);

-- Create ez_settings table
CREATE TABLE IF NOT EXISTS ez_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default monthly fee settings
INSERT INTO ez_settings (key, value) VALUES
  ('monthly_fee_typique', '800'),
  ('monthly_fee_dys', '1500'),
  ('monthly_fee_autiste', '2500'),
  ('monthly_fee_tdah', '1800')
ON CONFLICT (key) DO NOTHING;

-- Insert default role permissions
INSERT INTO ez_settings (key, value) VALUES
  ('role_permissions', '{
    "sales": {
      "view_submissions": true,
      "edit_submissions": true,
      "view_customers": true,
      "edit_customers": true,
      "view_payments": false,
      "edit_payments": false
    },
    "finance": {
      "view_submissions": false,
      "edit_submissions": false,
      "view_customers": true,
      "edit_customers": false,
      "view_payments": true,
      "edit_payments": true
    },
    "admin": {
      "view_submissions": true,
      "edit_submissions": true,
      "view_customers": true,
      "edit_customers": true,
      "view_payments": true,
      "edit_payments": true
    }
  }')
ON CONFLICT (key) DO NOTHING;

-- Create ez_user_roles table
CREATE TABLE IF NOT EXISTS ez_user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales', 'finance')),
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all CRM tables
ALTER TABLE ez_crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ez_crm_debt_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ez_crm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ez_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ez_user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ez_crm_customers
CREATE POLICY "Allow authenticated access on ez_crm_customers"
  ON ez_crm_customers
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for ez_crm_debt_adjustments
CREATE POLICY "Allow authenticated access on ez_crm_debt_adjustments"
  ON ez_crm_debt_adjustments
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for ez_crm_payments
CREATE POLICY "Allow authenticated access on ez_crm_payments"
  ON ez_crm_payments
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for ez_settings
CREATE POLICY "Allow authenticated read on ez_settings"
  ON ez_settings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admin write on ez_settings"
  ON ez_settings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM ez_user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin update on ez_settings"
  ON ez_settings
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM ez_user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for ez_user_roles
CREATE POLICY "Allow admin all on ez_user_roles"
  ON ez_user_roles
  FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users read own role on ez_user_roles"
  ON ez_user_roles
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
