<?php
require_once 'api/db.php';

try {
    $sql = file_get_contents('update_users_table.sql');
    $pdo->exec($sql);
    echo "Users table updated successfully.";
} catch (PDOException $e) {
    echo "Error updating table: " . $e->getMessage();
}
?>
