<?php
// api/register.php
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Username and password required"]);
    exit();
}

$id = uniqid();
$username = $data['username'];
$password = $data['password']; 
$fullName = $data['fullName'] ?? 'New User';
$email = $data['email'] ?? '';
$role = 'manager';

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Username already exists"]);
        exit();
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $status = 'active'; // Allow login so they can hit the subscription wall
    $country = $data['country'] ?? null;

    $sql = "INSERT INTO users (id, username, password, fullName, email, role, status, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id, $username, $passwordHash, $fullName, $email, $role, $status, $country]);

    echo json_encode([
        "id" => $id,
        "username" => $username,
        "fullName" => $fullName,
        "email" => $email,
        "role" => $role,
        "status" => $status
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
?>
