<?php
require_once 'db.php';

$tables = [
    'styles', 
    'style_variants', 
    'mix_match_groups', 
    'mix_match_items', 
    'customer_item_prices', 
    'settlements'
];

echo "<h1>Database Schema Inspection</h1>";

foreach ($tables as $table) {
    echo "<h2>Table: $table</h2>";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        foreach ($columns as $col) {
            echo "<tr>";
            foreach ($col as $val) {
                echo "<td>" . htmlspecialchars($val ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } catch (PDOException $e) {
        echo "<p style='color:red'>Error: " . $e->getMessage() . "</p>";
    }
}
?>
