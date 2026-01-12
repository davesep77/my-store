/*
  # Complete Inventory Management System Database Schema

  ## Overview
  This migration creates the complete database schema for a full-featured inventory management system
  with 19 interconnected tables supporting all business operations.

  ## Tables Created

  ### 1. Authentication & Users
    - `users` - User accounts with roles, subscription status, and authentication
      - id (uuid, primary key)
      - username (text, unique)
      - password (text, hashed)
      - full_name (text)
      - email (text, unique)
      - role (enum: admin, manager, viewer)
      - status (enum: active, pending_verification, banned, suspended)
      - country (text)
      - subscription_plan (text)
      - account_status (enum: trial, pending_payment, pending_approval, active, rejected, suspended)
      - payment_status (enum: unpaid, paid)
      - created_at, updated_at (timestamps)

  ### 2. Inventory Management
    - `departments` - Product categories/departments
    - `items` - Product inventory with SKU, pricing, stock levels
    - `transactions` - Sales, purchases, and stock movements

  ### 3. Customer & Vendor Relations
    - `customers` - Customer database with contact information
    - `vendors` - Supplier/vendor management
    - `customer_item_prices` - Customer-specific pricing
    - `backorders` - Out-of-stock customer orders

  ### 4. Employee Management
    - `employees` - Staff records with roles and pay rates
    - `time_entries` - Time clock for employee hours

  ### 5. Product Bundles & Variants
    - `kits` - Product bundles
    - `kit_components` - Items within kits
    - `styles` - Product style definitions
    - `style_variants` - Style variant options

  ### 6. Pricing & Promotions
    - `mix_match_groups` - Promotional pricing rules
    - `mix_match_items` - Items in promotions

  ### 7. Financial & Settings
    - `settlements` - Financial settlements
    - `payment_methods` - Payment method storage
    - `settings` - Global application settings

  ## Security
    - RLS enabled on all tables
    - Policies for authenticated user access
    - Proper foreign key constraints
*/

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'viewer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending_verification', 'banned', 'suspended')),
  country TEXT,
  subscription_plan TEXT DEFAULT 'starter',
  account_status TEXT DEFAULT 'trial' CHECK (account_status IN ('trial', 'pending_payment', 'pending_approval', 'active', 'rejected', 'suspended')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = (current_setting('app.user_id', true))::uuid);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) = 'admin');

-- ============================================
-- 2. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 3. ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) DEFAULT 0.00,
  selling_price DECIMAL(10, 2) DEFAULT 0.00,
  stock_alert_level INTEGER DEFAULT 10,
  remarks TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_department ON items(department_id);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage items"
  ON items FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 4. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID,
  date TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'opening')),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_batch ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item ON transactions(item_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage transactions"
  ON transactions FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 5. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_number TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_number ON customers(customer_number);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 6. VENDORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_number TEXT UNIQUE,
  company_name TEXT NOT NULL,
  po_delivery_method TEXT DEFAULT 'Email' CHECK (po_delivery_method IN ('Print', 'Email', 'Fax')),
  terms TEXT,
  flat_rent_rate DECIMAL(10, 2),
  tax_id TEXT,
  min_order DECIMAL(10, 2),
  commission_percent DECIMAL(5, 2),
  billable_department TEXT,
  social_security_number TEXT,
  address1 TEXT,
  address2 TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  fax TEXT,
  website TEXT,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_company ON vendors(company_name);
CREATE INDEX IF NOT EXISTS idx_vendors_number ON vendors(vendor_number);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage vendors"
  ON vendors FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 7. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  currency TEXT DEFAULT 'USD',
  locale TEXT DEFAULT 'en-US',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  email TEXT,
  invoice_header TEXT,
  invoice_footer TEXT,
  next_invoice_number INTEGER DEFAULT 1001,
  invoice_terms TEXT,
  tax_rate DECIMAL(5, 2) DEFAULT 0.00,
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'pro', 'enterprise')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) = 'admin');

-- ============================================
-- 8. PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('card', 'paypal')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  last4 TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  brand TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (true);

-- ============================================
-- 9. EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'Staff' CHECK (role IN ('Manager', 'Cashier', 'Staff')),
  pin_code TEXT,
  hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
  start_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_pin ON employees(pin_code);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage employees"
  ON employees FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 10. TIME ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS time_entries (
  id SERIAL PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_timestamp ON time_entries(timestamp);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read time entries"
  ON time_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage time entries"
  ON time_entries FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 11. KITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kits_name ON kits(name);

ALTER TABLE kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read kits"
  ON kits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage kits"
  ON kits FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 12. KIT COMPONENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kit_components (
  id SERIAL PRIMARY KEY,
  kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kit_components_kit ON kit_components(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_components_item ON kit_components(item_id);

ALTER TABLE kit_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read kit components"
  ON kit_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage kit components"
  ON kit_components FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 13. BACKORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS backorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backorders_customer ON backorders(customer_id);
CREATE INDEX IF NOT EXISTS idx_backorders_item ON backorders(item_id);
CREATE INDEX IF NOT EXISTS idx_backorders_status ON backorders(status);

ALTER TABLE backorders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read backorders"
  ON backorders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage backorders"
  ON backorders FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 14. STYLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_styles_name ON styles(name);
CREATE INDEX IF NOT EXISTS idx_styles_base_item ON styles(base_item_id);

ALTER TABLE styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read styles"
  ON styles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage styles"
  ON styles FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 15. STYLE VARIANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS style_variants (
  id SERIAL PRIMARY KEY,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  variant_value TEXT NOT NULL,
  sku_modifier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_style_variants_style ON style_variants(style_id);

ALTER TABLE style_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read style variants"
  ON style_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage style variants"
  ON style_variants FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 16. MIX MATCH GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mix_match_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'quantity' CHECK (type IN ('quantity', 'bogo')),
  quantity_needed INTEGER NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  discount_type TEXT DEFAULT 'fixed_price' CHECK (discount_type IN ('fixed_price', 'percentage_off')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mix_match_groups_name ON mix_match_groups(name);
CREATE INDEX IF NOT EXISTS idx_mix_match_groups_dates ON mix_match_groups(start_date, end_date);

ALTER TABLE mix_match_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mix match groups"
  ON mix_match_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mix match groups"
  ON mix_match_groups FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 17. MIX MATCH ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mix_match_items (
  id SERIAL PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES mix_match_groups(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_mix_match_items_group ON mix_match_items(group_id);
CREATE INDEX IF NOT EXISTS idx_mix_match_items_item ON mix_match_items(item_id);

ALTER TABLE mix_match_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mix match items"
  ON mix_match_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mix match items"
  ON mix_match_items FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 18. CUSTOMER ITEM PRICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customer_item_prices (
  id SERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_item_prices_customer ON customer_item_prices(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_item_prices_item ON customer_item_prices(item_id);

ALTER TABLE customer_item_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read customer prices"
  ON customer_item_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage customer prices"
  ON customer_item_prices FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));

-- ============================================
-- 19. SETTLEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settlements (
  id SERIAL PRIMARY KEY,
  settlement_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Settled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_date ON settlements(settlement_date);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settlements"
  ON settlements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settlements"
  ON settlements FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = (current_setting('app.user_id', true))::uuid) IN ('admin', 'manager'));
