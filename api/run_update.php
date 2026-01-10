<?php
require_once 'db.php';

$sql = file_get_contents('../database_update.sql');

try {
    $pdo->exec($sql);
    echo "<h1>Database Updated Successfully</h1>";
    echo "<p>All tables created.</p>";
} catch (PDOException $e) {
    echo "<h1>Error Updating Database</h1>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
