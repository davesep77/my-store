<?php
// setup_settings_update.php
require_once 'api/db.php';

$sqlFile = 'update_settings_schema.sql';
if (!file_exists($sqlFile)) {
    die("Error: $sqlFile not found.");
}

$sql = file_get_contents($sqlFile);

try {
    $pdo->exec($sql); 
    echo "Settings schema updated successfully!";
} catch (PDOException $e) {
    echo "Initial batch failed, trying fallback...\n";
    $stmts = [
        "ALTER TABLE settings ADD COLUMN invoiceHeader TEXT",
        "ALTER TABLE settings ADD COLUMN invoiceFooter TEXT",
        "ALTER TABLE settings ADD COLUMN nextInvoiceNumber INT DEFAULT 1000",
        "ALTER TABLE settings ADD COLUMN invoiceTerms TEXT",
        "ALTER TABLE settings ADD COLUMN taxRate DECIMAL(5,2) DEFAULT 0.00"
    ];
    
    foreach ($stmts as $s) {
        try {
            $pdo->exec($s);
             echo "Executed: $s\n";
        } catch (PDOException $ex) {
             if ($ex->errorInfo[1] == 1060) {
                 echo "Skipped (Exists): $s\n";
             } else {
                 echo "Error: " . $ex->getMessage() . "\n";
             }
        }
    }
}
?>
