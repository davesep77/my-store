<?php
require_once 'db.php';

try {
    // Drop the incorrect table
    $pdo->exec("DROP TABLE IF EXISTS settlements");
    
    // Recreate correctly
    $sql = "CREATE TABLE settlements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        settlement_date DATE,
        totalAmount DECIMAL(10, 2),
        status ENUM('Pending', 'Settled') DEFAULT 'Pending',
        notes TEXT
    )";
    $pdo->exec($sql);
    
    echo "<h1>Settlements Table Fixed</h1>";
    echo "<p>Table dropped and recreated with correct schema.</p>";
    
} catch (PDOException $e) {
    echo "<h1>Error</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
