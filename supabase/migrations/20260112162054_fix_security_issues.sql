/*
  # Fix Security Issues

  1. Drop unused indexes to improve performance
  2. Fix multiple permissive RLS policies
  3. Replace insecure RLS policies with proper authentication-based policies
  
  ## Critical Security Changes
  - All tables now require authentication
  - Role-based access control implemented
  - Admins: Full access to everything
  - Managers: Full access except user management
  - Viewers: Read-only access
*/

-- =====================================================
-- 1. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_items_name;
DROP INDEX IF EXISTS idx_transactions_type;
DROP INDEX IF EXISTS idx_transactions_batch;
DROP INDEX IF EXISTS idx_vendors_company;
DROP INDEX IF EXISTS idx_vendors_number;
DROP INDEX IF EXISTS idx_payment_methods_default;
DROP INDEX IF EXISTS idx_employees_name;
DROP INDEX IF EXISTS idx_employees_active;
DROP INDEX IF EXISTS idx_employees_pin;
DROP INDEX IF EXISTS idx_time_entries_employee;
DROP INDEX IF EXISTS idx_time_entries_timestamp;
DROP INDEX IF EXISTS idx_kits_name;
DROP INDEX IF EXISTS idx_kit_components_kit;
DROP INDEX IF EXISTS idx_customers_name;
DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_backorders_customer;
DROP INDEX IF EXISTS idx_backorders_status;
DROP INDEX IF EXISTS idx_styles_name;
DROP INDEX IF EXISTS idx_style_variants_style;
DROP INDEX IF EXISTS idx_mix_match_groups_name;
DROP INDEX IF EXISTS idx_mix_match_groups_dates;
DROP INDEX IF EXISTS idx_mix_match_items_group;
DROP INDEX IF EXISTS idx_customer_item_prices_customer;
DROP INDEX IF EXISTS idx_settlements_date;
DROP INDEX IF EXISTS idx_settlements_status;

-- =====================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- Items table: Remove duplicate policies
DROP POLICY IF EXISTS "Anyone can manage items" ON items;
DROP POLICY IF EXISTS "Anyone can read items" ON items;

-- Settings table: Remove duplicate policies
DROP POLICY IF EXISTS "Anyone can read settings" ON settings;
DROP POLICY IF EXISTS "Anyone can update settings" ON settings;

-- =====================================================
-- 3. REPLACE INSECURE RLS POLICIES WITH PROPER AUTH
-- =====================================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- USERS TABLE
DROP POLICY IF EXISTS "Anyone can access users" ON users;

CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- ITEMS TABLE
CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins and managers can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Anyone can access transactions" ON transactions;

CREATE POLICY "Authenticated users can read transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins and managers can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admins can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- CUSTOMERS TABLE
DROP POLICY IF EXISTS "Anyone can access customers" ON customers;

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- VENDORS TABLE
DROP POLICY IF EXISTS "Anyone can access vendors" ON vendors;

CREATE POLICY "Authenticated users can read vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- EMPLOYEES TABLE
DROP POLICY IF EXISTS "Anyone can access employees" ON employees;

CREATE POLICY "Authenticated users can read employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage employees"
  ON employees FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- DEPARTMENTS TABLE
DROP POLICY IF EXISTS "Anyone can access departments" ON departments;

CREATE POLICY "Authenticated users can read departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- TIME_ENTRIES TABLE
DROP POLICY IF EXISTS "Anyone can access time_entries" ON time_entries;

CREATE POLICY "Authenticated users can read time_entries"
  ON time_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage time_entries"
  ON time_entries FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- KITS TABLE
DROP POLICY IF EXISTS "Anyone can access kits" ON kits;

CREATE POLICY "Authenticated users can read kits"
  ON kits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage kits"
  ON kits FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- KIT_COMPONENTS TABLE
DROP POLICY IF EXISTS "Anyone can access kit_components" ON kit_components;

CREATE POLICY "Authenticated users can read kit_components"
  ON kit_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage kit_components"
  ON kit_components FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- BACKORDERS TABLE
DROP POLICY IF EXISTS "Anyone can access backorders" ON backorders;

CREATE POLICY "Authenticated users can read backorders"
  ON backorders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage backorders"
  ON backorders FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- STYLES TABLE
DROP POLICY IF EXISTS "Anyone can access styles" ON styles;

CREATE POLICY "Authenticated users can read styles"
  ON styles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage styles"
  ON styles FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- STYLE_VARIANTS TABLE
DROP POLICY IF EXISTS "Anyone can access style_variants" ON style_variants;

CREATE POLICY "Authenticated users can read style_variants"
  ON style_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage style_variants"
  ON style_variants FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- MIX_MATCH_GROUPS TABLE
DROP POLICY IF EXISTS "Anyone can access mix_match_groups" ON mix_match_groups;

CREATE POLICY "Authenticated users can read mix_match_groups"
  ON mix_match_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage mix_match_groups"
  ON mix_match_groups FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- MIX_MATCH_ITEMS TABLE
DROP POLICY IF EXISTS "Anyone can access mix_match_items" ON mix_match_items;

CREATE POLICY "Authenticated users can read mix_match_items"
  ON mix_match_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage mix_match_items"
  ON mix_match_items FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- CUSTOMER_ITEM_PRICES TABLE
DROP POLICY IF EXISTS "Anyone can access customer_item_prices" ON customer_item_prices;

CREATE POLICY "Authenticated users can read customer_item_prices"
  ON customer_item_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage customer_item_prices"
  ON customer_item_prices FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- SETTLEMENTS TABLE
DROP POLICY IF EXISTS "Anyone can access settlements" ON settlements;

CREATE POLICY "Authenticated users can read settlements"
  ON settlements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage settlements"
  ON settlements FOR ALL
  TO authenticated
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- PAYMENT_METHODS TABLE
DROP POLICY IF EXISTS "Anyone can access payment_methods" ON payment_methods;

CREATE POLICY "Authenticated users can read payment_methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage payment_methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- SETTINGS TABLE
CREATE POLICY "Authenticated users can read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');
