<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$port = getenv('DB_PORT') ?: '3310';
$dbname = 'store_inventory';

try {
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $pdo->exec("USE $dbname");

    $tables = [];

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'users';

    $pdo->exec("CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'departments';

    $pdo->exec("CREATE TABLE IF NOT EXISTS items (
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
        INDEX idx_department (departmentId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'items';

    $pdo->exec("CREATE TABLE IF NOT EXISTS transactions (
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
        INDEX idx_item (itemId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'transactions';

    $pdo->exec("CREATE TABLE IF NOT EXISTS customers (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'customers';

    $pdo->exec("CREATE TABLE IF NOT EXISTS vendors (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'vendors';

    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'settings';

    $check = $pdo->query("SELECT COUNT(*) as count FROM settings")->fetch();
    if ($check['count'] == 0) {
        $pdo->exec("INSERT INTO settings (id, currency, locale, dateFormat, subscriptionPlan, subscriptionStatus) VALUES (1, 'USD', 'en-US', 'MM/DD/YYYY', 'starter', 'active')");
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS payment_methods (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'payment_methods';

    $pdo->exec("CREATE TABLE IF NOT EXISTS employees (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'employees';

    $pdo->exec("CREATE TABLE IF NOT EXISTS time_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employeeId VARCHAR(50) NOT NULL,
        action ENUM('clock_in', 'clock_out', 'break_start', 'break_end') NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_employee (employeeId),
        INDEX idx_timestamp (timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'time_entries';

    $pdo->exec("CREATE TABLE IF NOT EXISTS kits (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'kits';

    $pdo->exec("CREATE TABLE IF NOT EXISTS kit_components (
        id INT PRIMARY KEY AUTO_INCREMENT,
        kitId VARCHAR(50) NOT NULL,
        itemId VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_kit (kitId),
        INDEX idx_item (itemId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'kit_components';

    $pdo->exec("CREATE TABLE IF NOT EXISTS backorders (
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
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'backorders';

    $pdo->exec("CREATE TABLE IF NOT EXISTS styles (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        baseItemId VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_base_item (baseItemId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'styles';

    $pdo->exec("CREATE TABLE IF NOT EXISTS style_variants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        styleId VARCHAR(50) NOT NULL,
        variantName VARCHAR(100) NOT NULL,
        variantValue VARCHAR(100) NOT NULL,
        skuModifier VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_style (styleId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'style_variants';

    $pdo->exec("CREATE TABLE IF NOT EXISTS mix_match_groups (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'mix_match_groups';

    $pdo->exec("CREATE TABLE IF NOT EXISTS mix_match_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        groupId VARCHAR(50) NOT NULL,
        itemId VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_group (groupId),
        INDEX idx_item (itemId),
        UNIQUE KEY unique_group_item (groupId, itemId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'mix_match_items';

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_item_prices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customerId VARCHAR(50) NOT NULL,
        itemId VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer (customerId),
        INDEX idx_item (itemId),
        UNIQUE KEY unique_customer_item (customerId, itemId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'customer_item_prices';

    $pdo->exec("CREATE TABLE IF NOT EXISTS settlements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        settlement_date DATE NOT NULL,
        totalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status ENUM('Pending', 'Settled') DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_date (settlement_date),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $tables[] = 'settlements';

    $tableCount = count($tables);
    $dbTables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "success" => true,
        "message" => "Database setup completed successfully!",
        "database" => $dbname,
        "tables_created" => $tableCount,
        "tables" => $tables,
        "existing_tables" => $dbTables,
        "connection" => [
            "host" => $host,
            "port" => $port,
            "user" => $user
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage(),
        "code" => $e->getCode(),
        "connection_attempted" => [
            "host" => $host,
            "port" => $port,
            "user" => $user,
            "database" => $dbname
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Server error: " . $e->getMessage()
    ]);
}
?>
