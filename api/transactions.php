<?php
// api/transactions.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM transactions ORDER BY date DESC");
        $transactions = $stmt->fetchAll();
        foreach ($transactions as &$t) {
            $t['quantity'] = (int)$t['quantity'];
            $t['unitPrice'] = (float)$t['unitPrice'];
        }
        echo json_encode($transactions);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO transactions (id, batchId, date, type, itemId, quantity, unitPrice, remarks) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $data['id'], 
                $data['batchId'] ?? null, 
                $data['date'], 
                $data['type'], 
                $data['itemId'], 
                $data['quantity'], 
                $data['unitPrice'], 
                $data['remarks'] ?? ''
            ]);
            http_response_code(201);
            echo json_encode(["message" => "Transaction created", "id" => $data['id']]);
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
        
        $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
        try {
            $stmt->execute([$id]);
            echo json_encode(["message" => "Transaction deleted successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
