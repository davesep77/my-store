<?php
// api/login.php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    require_once 'db.php';

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(422);
        echo json_encode(["error" => "Username and password required"]);
        exit();
    }

    $username = trim($data['username']);
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user) {
        $passwordValid = false;
        $needsRehash = false;

        // Check hash
        if (password_verify($password, $user['password'])) {
            $passwordValid = true;
            // Check if rehash needed (e.g. algorithm changed)
            if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
                $needsRehash = true;
            }
        }
        // Fallback for legacy plaintext (remove this block in strict production if all migrated)
        elseif ($password === $user['password']) {
            $passwordValid = true;
            $needsRehash = true; // Convert to hash
        }

        if ($passwordValid) {
            // Check status
            if ($user['status'] === 'pending_verification') {
                http_response_code(403);
                echo json_encode(["error" => "Account is pending admin verification."]);
                exit();
            }
            if ($user['status'] === 'banned' || $user['status'] === 'suspended') {
                http_response_code(403);
                echo json_encode(["error" => "Account is suspended."]);
                exit();
            }

            // Update hash if needed
            if ($needsRehash) {
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                $update->execute([$newHash, $user['id']]);
            }

            unset($user['password']); // Secure response

            // Ensure account_status field exists
            if (!isset($user['account_status'])) {
                $user['account_status'] = 'trial';
            }
            if (!isset($user['subscription_plan'])) {
                $user['subscription_plan'] = 'starter';
            }

            http_response_code(200);
            echo json_encode($user);
            exit();
        }
    }

    // Invalid credentials
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Server error: " . $e->getMessage()
    ]);
}
?>
