<?php
// setup_vendor_update.php
require_once 'api/db.php';

$sqlFile = 'update_vendors_schema.sql';
if (!file_exists($sqlFile)) {
    die("Error: $sqlFile not found.");
}

$sql = file_get_contents($sqlFile);

try {
    // We cannot use pdo->exec for DELIMITER syntax directly usually, 
    // but since we define a procedure, we might need a raw query. 
    // However, PHP PDO doesn't support DELIMITER cleanly in one go often for procedures.
    // Let's try basic multi-query execution.
    // Actually, simpler approach for this environment: Just run the ALTERs without the procedure wrapper logic if possible,
    // OR just try to run it and ignore "column exists" errors if we could, but SQL doesn't support "ADD IF NOT EXISTS" for columns easily in MySQL 5.7/8.0 without the procedure workaround.
    // Let's try the raw execution.
    
    $pdo->exec($sql); 
    echo "Vendor schema updated successfully!";
} catch (PDOException $e) {
    // If it fails on the delimiter stuff, we might need to be smarter. 
    // Fallback: Just run individual ALTERs wrapped in try-catch blocks here in PHP.
    
    echo "Initial batch failed, trying line-by-line fallback...\n";
    
    $columns = [
        "ALTER TABLE vendors ADD COLUMN vendorNumber VARCHAR(50)",
        "ALTER TABLE vendors ADD COLUMN poDeliveryMethod VARCHAR(50) DEFAULT 'Print'",
        "ALTER TABLE vendors ADD COLUMN terms VARCHAR(50)",
        "ALTER TABLE vendors ADD COLUMN flatRentRate DECIMAL(10, 2) DEFAULT 0.00",
        "ALTER TABLE vendors ADD COLUMN taxId VARCHAR(50)",
        "ALTER TABLE vendors ADD COLUMN minOrder DECIMAL(10, 2) DEFAULT 0.00",
        "ALTER TABLE vendors ADD COLUMN commissionPercent DECIMAL(5, 2) DEFAULT 0.00",
        "ALTER TABLE vendors ADD COLUMN billableDepartment VARCHAR(100)",
        "ALTER TABLE vendors ADD COLUMN socialSecurityNumber VARCHAR(50)",
        "ALTER TABLE vendors ADD COLUMN address1 VARCHAR(255)",
        "ALTER TABLE vendors ADD COLUMN address2 VARCHAR(255)",
        "ALTER TABLE vendors ADD COLUMN city VARCHAR(100)",
        "ALTER TABLE vendors ADD COLUMN state VARCHAR(50)",
        "ALTER TABLE vendors ADD COLUMN zip VARCHAR(20)",
        "ALTER TABLE vendors ADD COLUMN country VARCHAR(100)",
        "ALTER TABLE vendors ADD COLUMN contactFirstName VARCHAR(100)",
        "ALTER TABLE vendors ADD COLUMN contactLastName VARCHAR(100)",
        "ALTER TABLE vendors ADD COLUMN fax VARCHAR(50)"
    ];

    foreach ($columns as $query) {
        try {
            $pdo->exec($query);
            echo "Executed: $query\n";
        } catch (PDOException $ex) {
            // Ignore "Duplicate column name" error (Code 42S21)
            if ($ex->errorInfo[1] == 1060) {
                echo "Skipped (Exists): $query\n";
            } else {
                echo "Error: " . $ex->getMessage() . "\n";
            }
        }
    }
}
?>
