<?php
// setup_missing_tables.php
require_once 'api/db.php';

$sqlFile = 'update_missing_tables.sql';
if (!file_exists($sqlFile)) {
    die("Error: $sqlFile not found.");
}

$sql = file_get_contents($sqlFile);

try {
    // Split by semicolon to handle multiple statements if PDO::exec doesn't handle them all at once strictly
    // But mostly PDO can handle multiple, though strictly it returns result of first. 
    // Usually better to exec raw if driver supports it.
    
    // We'll try raw exec first
    $pdo->exec($sql);
    echo "Missing tables created successfully!";
} catch (PDOException $e) {
    echo "Batch execution encountered error: " . $e->getMessage() . "\n";
    echo "Attempting statement by statement...\n";
    
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $stmt) {
        if (empty($stmt)) continue;
        try {
            $pdo->exec($stmt);
            echo "Executed statement type: " . substr($stmt, 0, 20) . "...\n";
        } catch (PDOException $ex) {
            // 1050 is Table already exists
            if ($ex->errorInfo[1] == 1050) {
                 echo "Skipped (Table exists): " . substr($stmt, 0, 30) . "...\n";
            } else {
                 echo "Error executing: " . substr($stmt, 0, 50) . "... -> " . $ex->getMessage() . "\n";
            }
        }
    }
}
?>
