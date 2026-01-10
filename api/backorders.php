<?php
// api/backorders.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            // Join with items and customers to get names
            $sql = "SELECT b.*, i.name as itemName, i.sku, c.firstName, c.lastName, c.company 
                    FROM backorders b 
                    LEFT JOIN items i ON b.itemId = i.id 
                    LEFT JOIN customers c ON b.customerId = c.id 
                    ORDER BY b.orderDate DESC";
            $stmt = $pdo->query($sql);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO backorders (id, customerId, itemId, quantity, orderDate, status) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        try {
            $id = $data['id'] ?? uniqid('bo_');
            $stmt->execute([
                $id,
                $data['customerId'],
                $data['itemId'],
                $data['quantity'],
                $data['orderDate'] ?? date('Y-m-d'),
                $data['status'] ?? 'pending'
            ]);
            echo json_encode(["message" => "Back order created", "id" => $id]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "UPDATE backorders SET customerId=?, itemId=?, quantity=?, orderDate=?, status=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute([
                $data['customerId'],
                $data['itemId'],
                $data['quantity'],
                $data['orderDate'],
                $data['status'],
                $data['id']
            ]);
            echo json_encode(["message" => "Back order updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $pdo->prepare("DELETE FROM backorders WHERE id=?")->execute([$id]);
            echo json_encode(["message" => "Back order deleted"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
