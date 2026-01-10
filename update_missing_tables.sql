-- Employees Table (for Employee Maintenance & Time Clock)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) DEFAULT 'Staff', -- Manager, Cashier, etc.
    pinCode VARCHAR(10), -- For quick login/clock-in
    hourlyRate DECIMAL(10, 2) DEFAULT 0.00,
    startDate DATE,
    isActive BOOLEAN DEFAULT TRUE
);

-- Time Clock Entries
CREATE TABLE IF NOT EXISTS time_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employeeId VARCHAR(50),
    action ENUM(
        'clock_in',
        'clock_out',
        'break_start',
        'break_end'
    ),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees (id)
);

-- Kits (Bundles of items)
CREATE TABLE IF NOT EXISTS kits (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) -- Optional override price
);

CREATE TABLE IF NOT EXISTS kit_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kitId VARCHAR(50),
    itemId VARCHAR(50),
    quantity INT DEFAULT 1,
    FOREIGN KEY (kitId) REFERENCES kits (id),
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Styles Matrix (For items with variants like Size/Color)
CREATE TABLE IF NOT EXISTS styles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Men's T-Shirt"
    baseItemId VARCHAR(50), -- The parent item
    FOREIGN KEY (baseItemId) REFERENCES items (id)
);

CREATE TABLE IF NOT EXISTS style_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    styleId VARCHAR(50),
    variantName VARCHAR(50), -- e.g., "Size", "Color"
    variantValue VARCHAR(50), -- e.g., "XL", "Red"
    skuModifier VARCHAR(20), -- e.g., "-XL-RED"
    FOREIGN KEY (styleId) REFERENCES styles (id)
);

-- Back Orders (Items ordered but not yet received/fulfilled)
CREATE TABLE IF NOT EXISTS backorders (
    id VARCHAR(50) PRIMARY KEY,
    customerId VARCHAR(50), -- If for a customer
    itemId VARCHAR(50),
    quantity INT,
    orderDate DATE,
    status ENUM(
        'pending',
        'fulfilled',
        'cancelled'
    ) DEFAULT 'pending',
    FOREIGN KEY (customerId) REFERENCES customers (id),
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Customer Special Prices (Specific price for a specific customer on an item)
CREATE TABLE IF NOT EXISTS customer_item_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customerId VARCHAR(50),
    itemId VARCHAR(50),
    price DECIMAL(10, 2),
    FOREIGN KEY (customerId) REFERENCES customers (id),
    FOREIGN KEY (itemId) REFERENCES items (id),
    UNIQUE KEY unique_cust_item (customerId, itemId)
);

-- Mix 'N Match Pricing (Promotions)
CREATE TABLE IF NOT EXISTS mix_match_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM(
        'bogo',
        'percentage_off',
        'fixed_price',
        'bulk_discount'
    ),
    value DECIMAL(10, 2), -- e.g., 50 (for 50%), 10.00 (fixed price)
    quantityRequired INT DEFAULT 2, -- Buy 2 get...
    startDate DATE,
    endDate DATE,
    isActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS mix_match_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    groupId VARCHAR(50),
    itemId VARCHAR(50),
    FOREIGN KEY (groupId) REFERENCES mix_match_groups (id),
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Credit Card Settlements (Log of batch settlements)
CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(50) PRIMARY KEY,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    totalAmount DECIMAL(10, 2),
    transactionCount INT,
    status ENUM('success', 'failed') DEFAULT 'success',
    batchNumber VARCHAR(50)
);