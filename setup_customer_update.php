<?php
// setup_customer_update.php
require_once 'api/db.php';

$sqlFile = 'update_customers_schema.sql';
if (!file_exists($sqlFile)) {
    die("Error: $sqlFile not found.");
}

$sql = file_get_contents($sqlFile);

try {
    $pdo->exec($sql); 
    echo "Customer schema updated successfully!";
} catch (PDOException $e) {
    echo "Initial batch failed, trying line-by-line fallback...\n";
    
    $columns = [
        "ALTER TABLE customers ADD COLUMN customerNumber VARCHAR(50)",
        "ALTER TABLE customers ADD COLUMN company VARCHAR(100)",
        "ALTER TABLE customers ADD COLUMN zipCode VARCHAR(20)",
        "ALTER TABLE customers ADD COLUMN city VARCHAR(100)",
        "ALTER TABLE customers ADD COLUMN state VARCHAR(50)"
    ];

    foreach ($columns as $query) {
        try {
            $pdo->exec($query);
            echo "Executed: $query\n";
        } catch (PDOException $ex) {
             if ($ex->errorInfo[1] == 1060) {
                echo "Skipped (Exists): $query\n";
            } else {
                echo "Error: " . $ex->getMessage() . "\n";
            }
        }
    }
}
?>
