<?php
// api/payment_methods.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM payment_methods ORDER BY is_default DESC, created_at DESC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // If set as default, unset others first
        if (!empty($data['is_default'])) {
            $pdo->exec("UPDATE payment_methods SET is_default = 0");
        }

        $sql = "INSERT INTO payment_methods (id, type, provider, last4, expiry_month, expiry_year, brand, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute([
                $data['id'],
                $data['type'],
                $data['provider'],
                $data['last4'],
                $data['expiry_month'],
                $data['expiry_year'],
                $data['brand'],
                $data['is_default'] ? 1 : 0
            ]);
            echo json_encode(["message" => "Payment method added"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM payment_methods WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["message" => "Payment method deleted"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete"]);
        }
        break;
}
?>
