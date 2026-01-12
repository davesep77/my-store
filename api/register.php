<?php
// api/register.php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Username and password required"]);
        exit();
    }

    if (!isset($data['email']) || empty($data['email'])) {
        http_response_code(400);
        echo json_encode(["error" => "Email is required"]);
        exit();
    }

    $id = uniqid();
    $username = trim($data['username']);
    $password = $data['password'];
    $fullName = $data['fullName'] ?? 'New User';
    $email = trim($data['email']);
    $role = 'manager';
    $country = $data['country'] ?? null;
    $subscriptionPlan = $data['subscription_plan'] ?? 'starter';
    $accountStatus = 'trial';

    // Check if username exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Username already exists"]);
        exit();
    }

    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Email already exists"]);
        exit();
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $status = 'active';

    $sql = "INSERT INTO users (id, username, password, fullName, email, role, status, country, subscription_plan, account_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id, $username, $passwordHash, $fullName, $email, $role, $status, $country, $subscriptionPlan, $accountStatus]);

    http_response_code(201);
    echo json_encode([
        "id" => $id,
        "username" => $username,
        "fullName" => $fullName,
        "email" => $email,
        "role" => $role,
        "status" => $status,
        "account_status" => $accountStatus,
        "subscription_plan" => $subscriptionPlan,
        "country" => $country
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database error: " . $e->getMessage(),
        "code" => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server error: " . $e->getMessage()
    ]);
}
?>
