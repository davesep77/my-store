<?php
// api/settlements.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM settlements ORDER BY settlement_date DESC");
            $settlements = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($settlements as &$s) {
                $s['totalAmount'] = (float)$s['totalAmount'];
            }
            echo json_encode($settlements);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $stmt = $pdo->prepare("INSERT INTO settlements (settlement_date, totalAmount, status, notes) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['settlementDate'],
                $data['totalAmount'],
                $data['status'],
                $data['notes']
            ]);
            
            echo json_encode(["message" => "Settlement recorded"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $stmt = $pdo->prepare("UPDATE settlements SET settlement_date=?, totalAmount=?, status=?, notes=? WHERE id=?");
            $stmt->execute([
                $data['settlementDate'],
                $data['totalAmount'],
                $data['status'],
                $data['notes'],
                $data['id']
            ]);
            
            echo json_encode(["message" => "Settlement updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $pdo->prepare("DELETE FROM settlements WHERE id=?")->execute([$id]);
            echo json_encode(["message" => "Settlement deleted"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
