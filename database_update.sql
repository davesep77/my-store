-- Update Schema with missing tables

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(100),
    address TEXT
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    contactPerson VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    role VARCHAR(50),
    hourlyRate DECIMAL(10, 2),
    pin VARCHAR(10)
);

-- Time Entries
CREATE TABLE IF NOT EXISTS time_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employeeId VARCHAR(50),
    clockIn DATETIME,
    clockOut DATETIME,
    FOREIGN KEY (employeeId) REFERENCES employees (id)
);

-- Styles Matrix
CREATE TABLE IF NOT EXISTS styles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    baseItemId VARCHAR(50),
    FOREIGN KEY (baseItemId) REFERENCES items (id)
);

CREATE TABLE IF NOT EXISTS style_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    styleId VARCHAR(50),
    variantName VARCHAR(50),
    variantValue VARCHAR(50),
    skuModifier VARCHAR(50),
    FOREIGN KEY (styleId) REFERENCES styles (id)
);

-- Mix 'N Match Pricing
CREATE TABLE IF NOT EXISTS mix_match_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    type ENUM('quantity', 'bogo'),
    quantityNeeded INT,
    discountAmount DECIMAL(10, 2),
    discountType ENUM(
        'fixed_price',
        'percentage_off'
    ),
    startDate DATE,
    endDate DATE
);

CREATE TABLE IF NOT EXISTS mix_match_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    groupId VARCHAR(50),
    itemId VARCHAR(50),
    FOREIGN KEY (groupId) REFERENCES mix_match_groups (id),
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Customer Item Prices
CREATE TABLE IF NOT EXISTS customer_item_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customerId VARCHAR(50),
    itemId VARCHAR(50),
    price DECIMAL(10, 2),
    FOREIGN KEY (customerId) REFERENCES customers (id),
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Credit Card Settlements
CREATE TABLE IF NOT EXISTS settlements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    settlement_date DATE,
    totalAmount DECIMAL(10, 2),
    status ENUM('Pending', 'Settled') DEFAULT 'Pending',
    notes TEXT
);

-- Kits
CREATE TABLE IF NOT EXISTS kits (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS kit_items (
    kitId VARCHAR(50),
    itemId VARCHAR(50),
    quantity INT,
    FOREIGN KEY (kitId) REFERENCES kits (id),
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Back Orders
CREATE TABLE IF NOT EXISTS back_orders (
    id VARCHAR(50) PRIMARY KEY,
    itemId VARCHAR(50),
    quantity INT,
    customerName VARCHAR(100),
    contactParams VARCHAR(255),
    dateOrdered DATE,
    status ENUM('Pending', 'Fulfilled'),
    FOREIGN KEY (itemId) REFERENCES items (id)
);