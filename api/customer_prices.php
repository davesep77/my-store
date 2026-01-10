<?php
// api/customer_prices.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            $sql = "SELECT cip.*, 
                           c.firstName, c.lastName, c.company,
                           i.name as itemName, i.sku, i.sellingPrice as regularPrice
                    FROM customer_item_prices cip
                    LEFT JOIN customers c ON cip.customerId = c.id
                    LEFT JOIN items i ON cip.itemId = i.id
                    ORDER BY c.lastName, i.name";
            $stmt = $pdo->query($sql);
            $prices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($prices as &$p) {
                $p['price'] = (float)$p['price'];
                $p['regularPrice'] = (float)$p['regularPrice'];
            }
            
            echo json_encode($prices);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Check if price exists
            $check = $pdo->prepare("SELECT id FROM customer_item_prices WHERE customerId = ? AND itemId = ?");
            $check->execute([$data['customerId'], $data['itemId']]);
            if ($check->fetch()) {
                http_response_code(400);
                echo json_encode(["error" => "Price already defined for this customer and item"]);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO customer_item_prices (customerId, itemId, price) VALUES (?, ?, ?)");
            $stmt->execute([
                $data['customerId'],
                $data['itemId'],
                $data['price']
            ]);
            
            echo json_encode(["message" => "Price set"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $stmt = $pdo->prepare("UPDATE customer_item_prices SET price=? WHERE id=?");
            $stmt->execute([
                $data['price'],
                $data['id']
            ]);
            
            echo json_encode(["message" => "Price updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $pdo->prepare("DELETE FROM customer_item_prices WHERE id=?")->execute([$id]);
            echo json_encode(["message" => "Price deleted"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
