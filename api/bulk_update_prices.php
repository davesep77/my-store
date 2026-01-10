<?php
require_once 'db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!is_array($data) || empty($data)) {
            throw new Exception("Invalid payload provided");
        }

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("UPDATE items SET sellingPrice = :price, dateAdded = dateAdded WHERE id = :id");

        $updatedCount = 0;
        foreach ($data as $item) {
            if (!isset($item['id']) || !isset($item['price'])) {
                continue;
            }
            
            $stmt->execute([
                ':price' => $item['price'],
                ':id' => $item['id']
            ]);
            $updatedCount++;
        }

        $pdo->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Successfully updated $updatedCount items",
            "updatedCount" => $updatedCount
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
