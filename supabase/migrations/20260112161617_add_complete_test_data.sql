/*
  # Add Complete Test Data

  Comprehensive test data for all features.
*/

-- Clear existing test data
DELETE FROM time_entries;
DELETE FROM customer_item_prices;
DELETE FROM mix_match_items;
DELETE FROM mix_match_groups;
DELETE FROM kit_components;
DELETE FROM kits;
DELETE FROM backorders;
DELETE FROM transactions;
DELETE FROM items;
DELETE FROM employees;
DELETE FROM customers;
DELETE FROM vendors;
DELETE FROM departments;

-- Departments
INSERT INTO departments (id, name, description) VALUES
  (gen_random_uuid(), 'Electronics', 'Consumer electronics and gadgets'),
  (gen_random_uuid(), 'Clothing', 'Apparel and fashion'),
  (gen_random_uuid(), 'Food & Beverage', 'Grocery items'),
  (gen_random_uuid(), 'Home & Garden', 'Household items'),
  (gen_random_uuid(), 'Sports', 'Athletic gear');

-- Vendors
INSERT INTO vendors (id, vendor_number, company_name, po_delivery_method, terms, contact_first_name, contact_last_name, email, phone, address1, city, state, zip, country, commission_percent, min_order) VALUES
  (gen_random_uuid(), 'V001', 'TechSupply Inc', 'Email', 'Net 30', 'John', 'Smith', 'john@techsupply.com', '555-0101', '123 Tech Ave', 'San Francisco', 'CA', '94102', 'USA', 5.0, 500.00),
  (gen_random_uuid(), 'V002', 'Fashion Wholesale', 'Print', 'Net 45', 'Sarah', 'Johnson', 'sarah@fashion.com', '555-0102', '456 Style Blvd', 'New York', 'NY', '10001', 'USA', 7.5, 1000.00),
  (gen_random_uuid(), 'V003', 'Global Foods', 'Email', 'Net 15', 'Mike', 'Chen', 'mike@foods.com', '555-0103', '789 Market St', 'Chicago', 'IL', '60601', 'USA', 3.0, 300.00),
  (gen_random_uuid(), 'V004', 'HomeStyle Imports', 'Fax', 'Net 30', 'Emma', 'Davis', 'emma@homestyle.com', '555-0104', '321 Home Dr', 'Los Angeles', 'CA', '90001', 'USA', 6.0, 750.00),
  (gen_random_uuid(), 'V005', 'Athletic Pro', 'Email', 'Net 30', 'David', 'Wilson', 'david@athletic.com', '555-0105', '654 Sports Way', 'Seattle', 'WA', '98101', 'USA', 8.0, 600.00);

-- Customers
INSERT INTO customers (id, customer_number, first_name, last_name, company, email, phone, address, city, state, zip_code, notes) VALUES
  (gen_random_uuid(), 'C001', 'Alice', 'Anderson', 'Anderson Corp', 'alice@anderson.com', '555-1001', '100 Main St', 'Boston', 'MA', '02101', 'VIP'),
  (gen_random_uuid(), 'C002', 'Bob', 'Brown', 'Brown Enterprises', 'bob@brown.com', '555-1002', '200 Oak Ave', 'Portland', 'OR', '97201', 'Net 30'),
  (gen_random_uuid(), 'C003', 'Carol', 'Clark', NULL, 'carol@email.com', '555-1003', '300 Pine St', 'Denver', 'CO', '80201', 'Retail'),
  (gen_random_uuid(), 'C004', 'Daniel', 'Davis', 'Davis LLC', 'daniel@davis.com', '555-1004', '400 Elm St', 'Austin', 'TX', '78701', 'Wholesale'),
  (gen_random_uuid(), 'C005', 'Eva', 'Evans', NULL, 'eva@email.com', '555-1005', '500 Maple Dr', 'Miami', 'FL', '33101', 'Frequent'),
  (gen_random_uuid(), 'C006', 'Frank', 'Foster', 'Foster Group', 'frank@foster.com', '555-1006', '600 Cedar Ln', 'Phoenix', 'AZ', '85001', 'Large orders'),
  (gen_random_uuid(), 'C007', 'Grace', 'Green', NULL, 'grace@email.com', '555-1007', '700 Birch Rd', 'Atlanta', 'GA', '30301', 'Regular'),
  (gen_random_uuid(), 'C008', 'Henry', 'Harris', 'Harris Industries', 'henry@harris.com', '555-1008', '800 Spruce Ave', 'Dallas', 'TX', '75201', 'Credit OK'),
  (gen_random_uuid(), 'C009', 'Iris', 'Ivanov', NULL, 'iris@email.com', '555-1009', '900 Willow Way', 'Seattle', 'WA', '98102', 'New'),
  (gen_random_uuid(), 'C010', 'Jack', 'Jackson', 'Jackson Co', 'jack@jackson.com', '555-1010', '1000 Ash Pl', 'Detroit', 'MI', '48201', 'Monthly');

-- Employees
INSERT INTO employees (id, first_name, last_name, email, phone, address, role, pin_code, hourly_rate, start_date, is_active) VALUES
  (gen_random_uuid(), 'Emma', 'Williams', 'emma.w@store.com', '555-2001', '111 Staff St', 'Manager', '1111', 25.00, '2023-01-15', true),
  (gen_random_uuid(), 'Oliver', 'Smith', 'oliver.s@store.com', '555-2002', '222 Staff St', 'Cashier', '2222', 18.00, '2023-03-20', true),
  (gen_random_uuid(), 'Sophia', 'Johnson', 'sophia.j@store.com', '555-2003', '333 Staff St', 'Staff', '3333', 16.50, '2023-05-10', true),
  (gen_random_uuid(), 'Liam', 'Brown', 'liam.b@store.com', '555-2004', '444 Staff St', 'Cashier', '4444', 17.00, '2023-07-01', true),
  (gen_random_uuid(), 'Ava', 'Davis', 'ava.d@store.com', '555-2005', '555 Staff St', 'Staff', '5555', 22.00, '2023-02-28', true);

-- Items (50 products)
INSERT INTO items (id, sku, name, stock, unit_cost, selling_price, stock_alert_level, remarks) VALUES
  (gen_random_uuid(), 'ELEC001', 'Wireless Mouse', 45, 12.50, 24.99, 10, 'Popular'),
  (gen_random_uuid(), 'ELEC002', 'USB-C Cable 6ft', 120, 3.00, 9.99, 20, 'Fast seller'),
  (gen_random_uuid(), 'ELEC003', 'Bluetooth Headphones', 32, 25.00, 59.99, 5, 'Premium'),
  (gen_random_uuid(), 'ELEC004', 'Wireless Keyboard', 28, 18.00, 39.99, 8, 'Ergonomic'),
  (gen_random_uuid(), 'ELEC005', 'Phone Charger', 95, 4.50, 12.99, 15, 'Universal'),
  (gen_random_uuid(), 'ELEC006', 'HDMI Cable', 67, 5.00, 14.99, 12, 'Quality'),
  (gen_random_uuid(), 'ELEC007', 'Laptop Stand', 18, 15.00, 34.99, 5, 'Adjustable'),
  (gen_random_uuid(), 'ELEC008', 'Webcam HD', 22, 28.00, 69.99, 5, 'Pro'),
  (gen_random_uuid(), 'ELEC009', 'USB Hub', 41, 8.00, 19.99, 10, 'Compact'),
  (gen_random_uuid(), 'ELEC010', 'Power Bank', 35, 15.00, 34.99, 8, 'Fast charge'),
  (gen_random_uuid(), 'CLO001', 'T-Shirt Blue M', 75, 5.00, 14.99, 15, 'Classic'),
  (gen_random_uuid(), 'CLO002', 'T-Shirt Blue L', 68, 5.00, 14.99, 15, 'Classic'),
  (gen_random_uuid(), 'CLO003', 'Jeans 32x32', 42, 18.00, 49.99, 8, 'Regular'),
  (gen_random_uuid(), 'CLO004', 'Jeans 34x32', 38, 18.00, 49.99, 8, 'Regular'),
  (gen_random_uuid(), 'CLO005', 'Hoodie Gray L', 30, 12.00, 34.99, 6, 'Warm'),
  (gen_random_uuid(), 'CLO006', 'Running Shoes 10', 25, 22.00, 59.99, 5, 'Comfortable'),
  (gen_random_uuid(), 'CLO007', 'Baseball Cap', 55, 6.00, 16.99, 10, 'Adjustable'),
  (gen_random_uuid(), 'CLO008', 'Socks 3-Pack', 88, 4.00, 11.99, 15, 'Cotton'),
  (gen_random_uuid(), 'CLO009', 'Winter Jacket L', 18, 35.00, 89.99, 4, 'Waterproof'),
  (gen_random_uuid(), 'CLO010', 'Leather Belt', 44, 8.00, 24.99, 8, 'Genuine'),
  (gen_random_uuid(), 'FOOD001', 'Coffee 12oz', 156, 6.00, 14.99, 25, 'Organic'),
  (gen_random_uuid(), 'FOOD002', 'Green Tea 20ct', 92, 3.00, 8.99, 15, 'Antioxidant'),
  (gen_random_uuid(), 'FOOD003', 'Protein Bars 12ct', 78, 8.00, 18.99, 12, 'High protein'),
  (gen_random_uuid(), 'FOOD004', 'Granola 16oz', 65, 4.50, 11.99, 10, 'Organic'),
  (gen_random_uuid(), 'FOOD005', 'Almond Butter', 48, 7.00, 15.99, 8, 'Natural'),
  (gen_random_uuid(), 'FOOD006', 'Dark Chocolate', 112, 2.50, 6.99, 20, '70% cacao'),
  (gen_random_uuid(), 'FOOD007', 'Olive Oil', 38, 8.00, 19.99, 6, 'Extra virgin'),
  (gen_random_uuid(), 'FOOD008', 'Pasta 16oz', 125, 1.50, 3.99, 20, 'Italian'),
  (gen_random_uuid(), 'FOOD009', 'Tomatoes 28oz', 95, 2.00, 4.99, 15, 'Organic'),
  (gen_random_uuid(), 'FOOD010', 'Honey 12oz', 52, 5.50, 13.99, 10, 'Raw'),
  (gen_random_uuid(), 'HOME001', 'Plate Set 4pc', 34, 12.00, 29.99, 6, 'Dishwasher safe'),
  (gen_random_uuid(), 'HOME002', 'Steel Pot', 28, 18.00, 44.99, 5, 'Non-stick'),
  (gen_random_uuid(), 'HOME003', 'Knife Set 6pc', 22, 15.00, 39.99, 4, 'Sharp'),
  (gen_random_uuid(), 'HOME004', 'Cutting Board', 47, 8.00, 19.99, 8, 'Bamboo'),
  (gen_random_uuid(), 'HOME005', 'Storage Set', 31, 10.00, 24.99, 6, 'Glass'),
  (gen_random_uuid(), 'HOME006', 'Throw Pillow', 58, 6.00, 16.99, 10, 'Soft'),
  (gen_random_uuid(), 'HOME007', 'Picture Frame', 72, 4.00, 11.99, 12, 'Wood'),
  (gen_random_uuid(), 'HOME008', 'Desk Lamp', 26, 14.00, 34.99, 5, 'LED'),
  (gen_random_uuid(), 'HOME009', 'Watering Can', 36, 7.00, 17.99, 6, 'Plastic'),
  (gen_random_uuid(), 'HOME010', 'Planter Pot', 41, 9.00, 22.99, 8, 'Ceramic'),
  (gen_random_uuid(), 'SPORT001', 'Yoga Mat', 52, 10.00, 24.99, 10, 'Non-slip'),
  (gen_random_uuid(), 'SPORT002', 'Dumbbells 10lb', 28, 15.00, 39.99, 5, 'Rubber'),
  (gen_random_uuid(), 'SPORT003', 'Resistance Bands', 45, 8.00, 19.99, 8, 'Multi-level'),
  (gen_random_uuid(), 'SPORT004', 'Water Bottle', 88, 5.00, 14.99, 15, 'BPA free'),
  (gen_random_uuid(), 'SPORT005', 'Jump Rope', 64, 4.00, 9.99, 12, 'Adjustable'),
  (gen_random_uuid(), 'SPORT006', 'Foam Roller', 32, 12.00, 29.99, 6, 'Recovery'),
  (gen_random_uuid(), 'SPORT007', 'Gym Bag', 38, 16.00, 39.99, 6, 'Spacious'),
  (gen_random_uuid(), 'SPORT008', 'Tennis Balls', 76, 5.00, 12.99, 12, 'Pro'),
  (gen_random_uuid(), 'SPORT009', 'Basketball', 24, 18.00, 44.99, 5, 'Indoor/outdoor'),
  (gen_random_uuid(), 'SPORT010', 'Soccer Ball', 31, 16.00, 39.99, 6, 'Official');

-- Sales (60 transactions)
DO $$
DECLARE batch_id UUID; item_rec RECORD; i INT;
BEGIN
  FOR i IN 1..20 LOOP
    batch_id := gen_random_uuid();
    FOR item_rec IN SELECT id, selling_price FROM items ORDER BY random() LIMIT 3 LOOP
      INSERT INTO transactions (id, batch_id, date, type, item_id, quantity, unit_price, remarks)
      VALUES (gen_random_uuid(), batch_id, CURRENT_DATE - floor(random() * 30)::INT, 'sale', item_rec.id, floor(random() * 5 + 1)::INT, item_rec.selling_price, 'Customer sale');
    END LOOP;
  END LOOP;
END $$;

-- Purchases (20 transactions)
DO $$
DECLARE batch_id UUID; item_rec RECORD; i INT;
BEGIN
  FOR i IN 1..10 LOOP
    batch_id := gen_random_uuid();
    FOR item_rec IN SELECT id, unit_cost FROM items ORDER BY random() LIMIT 2 LOOP
      INSERT INTO transactions (id, batch_id, date, type, item_id, quantity, unit_price, remarks)
      VALUES (gen_random_uuid(), batch_id, CURRENT_DATE - floor(random() * 25)::INT, 'purchase', item_rec.id, floor(random() * 30 + 10)::INT, item_rec.unit_cost, 'Stock replenishment');
    END LOOP;
  END LOOP;
END $$;

-- Time Entries
DO $$
DECLARE emp RECORD; d INT; dt DATE;
BEGIN
  FOR emp IN SELECT id FROM employees WHERE is_active = true LOOP
    FOR d IN 0..6 LOOP
      dt := CURRENT_DATE - d;
      INSERT INTO time_entries (employee_id, action, timestamp) VALUES
        (emp.id, 'clock_in', dt + interval '9 hours'),
        (emp.id, 'break_start', dt + interval '12 hours'),
        (emp.id, 'break_end', dt + interval '13 hours'),
        (emp.id, 'clock_out', dt + interval '17 hours');
    END LOOP;
  END LOOP;
END $$;

-- Kits
DO $$
DECLARE kit_id UUID;
BEGIN
  kit_id := gen_random_uuid();
  INSERT INTO kits (id, name, description, price)
  VALUES (kit_id, 'Office Kit', 'Mouse, Keyboard, Stand', 89.99);
  INSERT INTO kit_components (kit_id, item_id, quantity)
  SELECT kit_id, id, 1 FROM items WHERE sku IN ('ELEC001', 'ELEC004', 'ELEC007');
  
  kit_id := gen_random_uuid();
  INSERT INTO kits (id, name, description, price)
  VALUES (kit_id, 'Chef Bundle', 'Pot, Knives, Board', 99.99);
  INSERT INTO kit_components (kit_id, item_id, quantity)
  SELECT kit_id, id, 1 FROM items WHERE sku IN ('HOME002', 'HOME003', 'HOME004');
END $$;

-- Backorders
INSERT INTO backorders (id, customer_id, item_id, quantity, order_date, status)
SELECT gen_random_uuid(), (SELECT id FROM customers ORDER BY random() LIMIT 1), id,
  floor(random() * 8 + 2)::INT, CURRENT_DATE - floor(random() * 10)::INT,
  CASE WHEN random() < 0.7 THEN 'pending' ELSE 'fulfilled' END
FROM items WHERE stock < 30 LIMIT 8;

-- VIP Pricing
INSERT INTO customer_item_prices (customer_id, item_id, price)
SELECT (SELECT id FROM customers WHERE customer_number = 'C001'), id, (selling_price * 0.90)::NUMERIC(10,2)
FROM items WHERE sku LIKE 'ELEC%';

-- Promotions (valid types: 'quantity' or 'bogo', valid discount_types: 'fixed_price' or 'percentage_off')
DO $$
DECLARE gid UUID;
BEGIN
  gid := gen_random_uuid();
  INSERT INTO mix_match_groups (id, name, type, quantity_needed, discount_amount, discount_type, start_date, end_date)
  VALUES (gid, 'Buy 3 Food Items Save 10%', 'quantity', 3, 10, 'percentage_off', CURRENT_DATE, CURRENT_DATE + 60);
  INSERT INTO mix_match_items (group_id, item_id) SELECT gid, id FROM items WHERE sku LIKE 'FOOD%';
  
  gid := gen_random_uuid();
  INSERT INTO mix_match_groups (id, name, type, quantity_needed, discount_amount, discount_type, start_date, end_date)
  VALUES (gid, 'BOGO Clothing Deal', 'bogo', 2, 5, 'fixed_price', CURRENT_DATE, CURRENT_DATE + 45);
  INSERT INTO mix_match_items (group_id, item_id) SELECT gid, id FROM items WHERE sku LIKE 'CLO%' LIMIT 8;
  
  gid := gen_random_uuid();
  INSERT INTO mix_match_groups (id, name, type, quantity_needed, discount_amount, discount_type, start_date, end_date)
  VALUES (gid, 'Buy 4 Sports Items Save 15%', 'quantity', 4, 15, 'percentage_off', CURRENT_DATE, CURRENT_DATE + 30);
  INSERT INTO mix_match_items (group_id, item_id) SELECT gid, id FROM items WHERE sku LIKE 'SPORT%';
END $$;
