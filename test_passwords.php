<?php
$host = 'localhost';
$port = '3310';
$db   = 'store_inventory';
$user = 'root';
$charset = 'utf8mb4';

$passwords = ['', 'root', 'admin', 'password', '123456', '1234', 'mysql'];

echo "Testing database connection on Port $port with common passwords...\n";

foreach ($passwords as $pass) {
    try {
        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, $user, $pass, $options);
        echo "SUCCESS! Connection established on Port $port with password: '$pass'\n";
        exit(0);
    } catch (\PDOException $e) {
        // continue
    }
}

echo "FAILURE: Could not connect on Port $port with common passwords.\n";
exit(1);
?>
