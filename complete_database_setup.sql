-- ===============================================
-- COMPLETE DATABASE SETUP FOR INVENTORY MANAGER
-- ===============================================
-- This script creates all necessary tables for the inventory management system
-- Run this in phpMyAdmin or your MySQL client

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS store_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE store_inventory;

-- ===============================================
-- 1. USERS TABLE (Authentication & Authorization)
-- ===============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    role ENUM('admin', 'manager', 'viewer') DEFAULT 'manager',
    status ENUM('active', 'pending_verification', 'banned', 'suspended') DEFAULT 'active',
    country VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'starter',
    account_status ENUM('trial', 'pending_payment', 'pending_approval', 'active', 'rejected', 'suspended') DEFAULT 'trial',
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 2. DEPARTMENTS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 3. ITEMS TABLE (Products/Inventory)
-- ===============================================
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    stock INT DEFAULT 0,
    unitCost DECIMAL(10, 2) DEFAULT 0.00,
    sellingPrice DECIMAL(10, 2) DEFAULT 0.00,
    stockAlertLevel INT DEFAULT 10,
    remarks TEXT,
    departmentId VARCHAR(50),
    dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_name (name),
    INDEX idx_department (departmentId),
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 4. TRANSACTIONS TABLE (Sales & Purchases)
-- ===============================================
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    batchId VARCHAR(50),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type ENUM('sale', 'purchase', 'opening') NOT NULL,
    itemId VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(10, 2) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_batch (batchId),
    INDEX idx_item (itemId),
    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 5. CUSTOMERS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    customerNumber VARCHAR(50) UNIQUE,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    company VARCHAR(200),
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zipCode VARCHAR(20),
    notes TEXT,
    dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (lastName, firstName),
    INDEX idx_email (email),
    INDEX idx_customer_number (customerNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 6. VENDORS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    vendorNumber VARCHAR(50) UNIQUE,
    companyName VARCHAR(200) NOT NULL,
    poDeliveryMethod ENUM('Print', 'Email', 'Fax') DEFAULT 'Email',
    terms VARCHAR(100),
    flatRentRate DECIMAL(10, 2),
    taxId VARCHAR(50),
    minOrder DECIMAL(10, 2),
    commissionPercent DECIMAL(5, 2),
    billableDepartment VARCHAR(100),
    socialSecurityNumber VARCHAR(50),
    address1 VARCHAR(255),
    address2 VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    country VARCHAR(100),
    contactFirstName VARCHAR(100),
    contactLastName VARCHAR(100),
    contactPerson VARCHAR(200),
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    fax VARCHAR(50),
    website VARCHAR(255),
    dateAdded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company (companyName),
    INDEX idx_vendor_number (vendorNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 7. SETTINGS TABLE (Global Application Settings)
-- ===============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    currency VARCHAR(10) DEFAULT 'USD',
    locale VARCHAR(10) DEFAULT 'en-US',
    dateFormat VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    email VARCHAR(200),
    invoiceHeader TEXT,
    invoiceFooter TEXT,
    nextInvoiceNumber INT DEFAULT 1001,
    invoiceTerms TEXT,
    taxRate DECIMAL(5, 2) DEFAULT 0.00,
    subscriptionPlan ENUM('starter', 'pro', 'enterprise') DEFAULT 'starter',
    billingCycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    subscriptionStatus ENUM('active', 'inactive', 'cancelled') DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings if not exists
INSERT INTO settings (id, currency, locale, dateFormat, subscriptionPlan, subscriptionStatus)
SELECT 1, 'USD', 'en-US', 'MM/DD/YYYY', 'starter', 'active'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);

-- ===============================================
-- 8. PAYMENT METHODS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('card', 'paypal') NOT NULL,
    provider ENUM('stripe', 'paypal') NOT NULL,
    last4 VARCHAR(4),
    expiry_month INT,
    expiry_year INT,
    brand VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 9. EMPLOYEES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    role ENUM('Manager', 'Cashier', 'Staff') DEFAULT 'Staff',
    pinCode VARCHAR(10),
    hourlyRate DECIMAL(10, 2) DEFAULT 0.00,
    startDate DATE,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (lastName, firstName),
    INDEX idx_active (isActive),
    INDEX idx_pin (pinCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 10. TIME ENTRIES TABLE (Employee Clock In/Out)
-- ===============================================
CREATE TABLE IF NOT EXISTS time_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employeeId VARCHAR(50) NOT NULL,
    action ENUM('clock_in', 'clock_out', 'break_start', 'break_end') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_employee (employeeId),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 11. KITS TABLE (Product Bundles)
-- ===============================================
CREATE TABLE IF NOT EXISTS kits (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 12. KIT COMPONENTS TABLE (Items in Kits)
-- ===============================================
CREATE TABLE IF NOT EXISTS kit_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kitId VARCHAR(50) NOT NULL,
    itemId VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kit (kitId),
    INDEX idx_item (itemId),
    FOREIGN KEY (kitId) REFERENCES kits(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 13. BACKORDERS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS backorders (
    id VARCHAR(50) PRIMARY KEY,
    customerId VARCHAR(50) NOT NULL,
    itemId VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer (customerId),
    INDEX idx_item (itemId),
    INDEX idx_status (status),
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 14. STYLES TABLE (Product Variants)
-- ===============================================
CREATE TABLE IF NOT EXISTS styles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    baseItemId VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_base_item (baseItemId),
    FOREIGN KEY (baseItemId) REFERENCES items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 15. STYLE VARIANTS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS style_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    styleId VARCHAR(50) NOT NULL,
    variantName VARCHAR(100) NOT NULL,
    variantValue VARCHAR(100) NOT NULL,
    skuModifier VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_style (styleId),
    FOREIGN KEY (styleId) REFERENCES styles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 16. MIX MATCH GROUPS TABLE (Pricing Rules)
-- ===============================================
CREATE TABLE IF NOT EXISTS mix_match_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('quantity', 'bogo') DEFAULT 'quantity',
    quantityNeeded INT NOT NULL,
    discountAmount DECIMAL(10, 2) NOT NULL,
    discountType ENUM('fixed_price', 'percentage_off') DEFAULT 'fixed_price',
    startDate DATE,
    endDate DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_dates (startDate, endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 17. MIX MATCH ITEMS TABLE (Items in Pricing Rules)
-- ===============================================
CREATE TABLE IF NOT EXISTS mix_match_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    groupId VARCHAR(50) NOT NULL,
    itemId VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_group (groupId),
    INDEX idx_item (itemId),
    UNIQUE KEY unique_group_item (groupId, itemId),
    FOREIGN KEY (groupId) REFERENCES mix_match_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 18. CUSTOMER ITEM PRICES TABLE (Custom Pricing)
-- ===============================================
CREATE TABLE IF NOT EXISTS customer_item_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customerId VARCHAR(50) NOT NULL,
    itemId VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer (customerId),
    INDEX idx_item (itemId),
    UNIQUE KEY unique_customer_item (customerId, itemId),
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- 19. SETTLEMENTS TABLE (Financial Settlements)
-- ===============================================
CREATE TABLE IF NOT EXISTS settlements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    settlement_date DATE NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Pending', 'Settled') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (settlement_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================
-- Run these to verify your setup
SELECT 'Database created successfully!' as Status;
SELECT COUNT(*) as TableCount FROM information_schema.tables WHERE table_schema = 'store_inventory';
SHOW TABLES;
