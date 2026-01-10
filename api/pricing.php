<?php
// api/pricing.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            // Fetch groups
            $stmt = $pdo->query("SELECT * FROM mix_match_groups ORDER BY name");
            $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch items for groups
            $iStmt = $pdo->query("SELECT mmi.*, i.name as itemName, i.sku, i.price FROM mix_match_items mmi LEFT JOIN items i ON mmi.itemId = i.id");
            $allItems = $iStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($groups as &$group) {
                $group['quantityNeeded'] = (int)$group['quantityNeeded'];
                $group['discountAmount'] = (float)$group['discountAmount'];
                $group['items'] = array_values(array_filter($allItems, function($i) use ($group) {
                    return $i['groupId'] === $group['id'];
                }));
            }

            echo json_encode($groups);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("INSERT INTO mix_match_groups (id, name, type, quantityNeeded, discountAmount, discountType, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['id'],
                $data['name'],
                $data['type'],
                $data['quantityNeeded'],
                $data['discountAmount'],
                $data['discountType'],
                $data['startDate'],
                $data['endDate']
            ]);
            
            if (!empty($data['items'])) {
                $iStmt = $pdo->prepare("INSERT INTO mix_match_items (groupId, itemId) VALUES (?, ?)");
                foreach ($data['items'] as $item) {
                     // Check if item is just an ID or object
                     $itemId = is_array($item) ? $item['itemId'] : $item;
                     $iStmt->execute([$data['id'], $itemId]);
                }
            }
            
            $pdo->commit();
            echo json_encode(["message" => "Pricing rule created"]);
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
            
            $stmt = $pdo->prepare("UPDATE mix_match_groups SET name=?, type=?, quantityNeeded=?, discountAmount=?, discountType=?, startDate=?, endDate=? WHERE id=?");
            $stmt->execute([
                $data['name'],
                $data['type'],
                $data['quantityNeeded'],
                $data['discountAmount'],
                $data['discountType'],
                $data['startDate'],
                $data['endDate'],
                $data['id']
            ]);
            
            // Re-create items
            $pdo->prepare("DELETE FROM mix_match_items WHERE groupId=?")->execute([$data['id']]);
            
            if (!empty($data['items'])) {
                $iStmt = $pdo->prepare("INSERT INTO mix_match_items (groupId, itemId) VALUES (?, ?)");
                foreach ($data['items'] as $item) {
                     $itemId = is_array($item) ? $item['itemId'] : $item;
                     $iStmt->execute([$data['id'], $itemId]);
                }
            }
            
            $pdo->commit();
            echo json_encode(["message" => "Pricing rule updated"]);
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
            $pdo->prepare("DELETE FROM mix_match_items WHERE groupId=?")->execute([$id]);
            $pdo->prepare("DELETE FROM mix_match_groups WHERE id=?")->execute([$id]);
            $pdo->commit();
            echo json_encode(["message" => "Pricing rule deleted"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
