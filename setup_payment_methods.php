<?php
require_once 'api/db.php';

try {
    $sql = file_get_contents('create_payment_methods_table.sql');
    $pdo->exec($sql);
    echo "Payment methods table created successfully.";
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage();
}
?>
