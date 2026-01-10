<?php
// setup_update.php
// Uses db.php to reuse the connection (and password)
require_once 'api/db.php';

$sqlFile = 'update_schema.sql';
if (!file_exists($sqlFile)) {
    die("Error: $sqlFile not found.");
}

$sql = file_get_contents($sqlFile);

try {
    // Split by semicolon to handle multiple statements if PDO doesn't support generic batch
    // Actually PDO might support it but let's be safe for varied environments?
    // But since we have specific delimiters or logic, simple split might fail on text content.
    // However, for this simple file, it is fine.
    
    // Actually, let's just try running it.
    $pdo->exec($sql);
    echo "Database schema updated successfully!";
} catch (PDOException $e) {
    echo "Error updating schema: " . $e->getMessage();
}
?>
