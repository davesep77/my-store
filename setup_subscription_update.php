<?php
require_once 'api/db.php';

try {
    $sql = file_get_contents('update_subscription_schema.sql');
    $pdo->exec($sql);
    echo "Subscription columns added successfully.";
} catch (PDOException $e) {
    echo "Error updating schema: " . $e->getMessage();
}
?>
