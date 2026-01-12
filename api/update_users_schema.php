<?php
// api/update_users_schema.php
// Run this file once to update the users table schema
header('Content-Type: application/json');

try {
    require_once 'db.php';

    // Add subscription_plan column
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'starter'");

    // Add account_status column
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'trial'");

    // Update existing users
    $pdo->exec("UPDATE users SET subscription_plan = 'starter' WHERE subscription_plan IS NULL OR subscription_plan = ''");
    $pdo->exec("UPDATE users SET account_status = 'trial' WHERE account_status IS NULL OR account_status = ''");

    echo json_encode([
        "success" => true,
        "message" => "Users table updated successfully"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Database error: " . $e->getMessage()
    ]);
}
?>
