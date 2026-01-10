<?php
// api/items.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM items ORDER BY dateAdded DESC");
        $items = $stmt->fetchAll();
        // Convert numbers to correct types if needed (PDO usually returns strings)
        foreach ($items as &$item) {
            $item['stock'] = (int)$item['stock'];
            $item['unitCost'] = (float)$item['unitCost'];
            $item['sellingPrice'] = (float)$item['sellingPrice'];
            $item['stockAlertLevel'] = (int)$item['stockAlertLevel'];
        }
        echo json_encode($items);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON data"]);
            exit();
        }
        
        $sql = "INSERT INTO items (id, sku, name, stock, unitCost, sellingPrice, stockAlertLevel, remarks, dateAdded) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $data['id'], 
                $data['sku'], 
                $data['name'], 
                $data['stock'], 
                $data['unitCost'], 
                $data['sellingPrice'], 
                $data['stockAlertLevel'] ?? 5, 
                $data['remarks'] ?? '', 
                $data['dateAdded']
            ]);
            http_response_code(201);
            echo json_encode(["message" => "Item created successfully", "id" => $data['id']]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required"]);
            exit();
        }

        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }
        $values[] = $data['id'];

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(["error" => "No fields to update"]);
            exit();
        }

        $sql = "UPDATE items SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute($values);
            echo json_encode(["message" => "Item updated successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required"]);
            exit();
        }
        
        $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
        try {
            $stmt->execute([$id]);
            echo json_encode(["message" => "Item deleted successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
