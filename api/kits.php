<?php
// api/kits.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM kits ORDER BY name");
            $kits = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Fetch components for each kit
            // Optimized: Fetch all components and map them
            $compStmt = $pdo->query("SELECT kc.*, i.name as itemName, i.sku FROM kit_components kc LEFT JOIN items i ON kc.itemId = i.id");
            $allComponents = $compStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($kits as &$kit) {
                $kit['price'] = (float)$kit['price'];
                $kit['components'] = array_values(array_filter($allComponents, function($c) use ($kit) {
                    return $c['kitId'] === $kit['id'];
                }));
            }
            
            echo json_encode($kits);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("INSERT INTO kits (id, name, description, price) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['id'],
                $data['name'],
                $data['description'] ?? null,
                $data['price'] ?? 0
            ]);
            
            if (!empty($data['components'])) {
                $cStmt = $pdo->prepare("INSERT INTO kit_components (kitId, itemId, quantity) VALUES (?, ?, ?)");
                foreach ($data['components'] as $comp) {
                    if ($comp['quantity'] > 0) {
                        $cStmt->execute([$data['id'], $comp['itemId'], $comp['quantity']]);
                    }
                }
            }
            
            $pdo->commit();
            echo json_encode(["message" => "Kit created"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("UPDATE kits SET name=?, description=?, price=? WHERE id=?");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? null,
                $data['price'] ?? 0,
                $data['id']
            ]);
            
            // Replace components
            $pdo->prepare("DELETE FROM kit_components WHERE kitId=?")->execute([$data['id']]);
            
            if (!empty($data['components'])) {
                $cStmt = $pdo->prepare("INSERT INTO kit_components (kitId, itemId, quantity) VALUES (?, ?, ?)");
                foreach ($data['components'] as $comp) {
                     if ($comp['quantity'] > 0) {
                        $cStmt->execute([$data['id'], $comp['itemId'], $comp['quantity']]);
                    }
                }
            }
            
            $pdo->commit();
            echo json_encode(["message" => "Kit updated"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM kit_components WHERE kitId=?")->execute([$id]);
            $pdo->prepare("DELETE FROM kits WHERE id=?")->execute([$id]);
            $pdo->commit();
            echo json_encode(["message" => "Kit deleted"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
