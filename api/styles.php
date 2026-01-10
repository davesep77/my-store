<?php
// api/styles.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            // Fetch all styles
            $stmt = $pdo->query("SELECT s.*, i.name as baseItemName FROM styles s LEFT JOIN items i ON s.baseItemId = i.id ORDER BY s.name");
            $styles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch variants for these styles
            $vStmt = $pdo->query("SELECT * FROM style_variants ORDER BY id");
            $allVariants = $vStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($styles as &$style) {
                $style['variants'] = array_values(array_filter($allVariants, function($v) use ($style) {
                    return $v['styleId'] === $style['id'];
                }));
            }

            echo json_encode($styles);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("INSERT INTO styles (id, name, baseItemId) VALUES (?, ?, ?)");
            $stmt->execute([
                $data['id'],
                $data['name'],
                $data['baseItemId'] ?? null
            ]);
            
            if (!empty($data['variants'])) {
                $vStmt = $pdo->prepare("INSERT INTO style_variants (styleId, variantName, variantValue, skuModifier) VALUES (?, ?, ?, ?)");
                foreach ($data['variants'] as $v) {
                    $vStmt->execute([
                        $data['id'],
                        $v['variantName'],
                        $v['variantValue'],
                        $v['skuModifier']
                    ]);
                }
            }
            
            $pdo->commit();
            echo json_encode(["message" => "Style created"]);
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
            
            $stmt = $pdo->prepare("UPDATE styles SET name=?, baseItemId=? WHERE id=?");
            $stmt->execute([
                $data['name'],
                $data['baseItemId'] ?? null,
                $data['id']
            ]);
            
            // Re-create variants for simplicity
            $pdo->prepare("DELETE FROM style_variants WHERE styleId=?")->execute([$data['id']]);
            
            if (!empty($data['variants'])) {
                $vStmt = $pdo->prepare("INSERT INTO style_variants (styleId, variantName, variantValue, skuModifier) VALUES (?, ?, ?, ?)");
                foreach ($data['variants'] as $v) {
                    $vStmt->execute([
                        $data['id'],
                        $v['variantName'],
                        $v['variantValue'],
                        $v['skuModifier']
                    ]);
                }
            }
            
            $pdo->commit();
            echo json_encode(["message" => "Style updated"]);
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
            $pdo->prepare("DELETE FROM style_variants WHERE styleId=?")->execute([$id]);
            $pdo->prepare("DELETE FROM styles WHERE id=?")->execute([$id]);
            $pdo->commit();
            echo json_encode(["message" => "Style deleted"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
