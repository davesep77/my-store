<?php
// api/time_clock.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        // Optional filter by employeeId or date range
        $employeeId = $_GET['employeeId'] ?? null;
        $date = $_GET['date'] ?? null;
        
        $sql = "SELECT t.*, e.firstName, e.lastName FROM time_entries t JOIN employees e ON t.employeeId = e.id";
        $params = [];
        $conditions = [];

        if ($employeeId) {
            $conditions[] = "t.employeeId = ?";
            $params[] = $employeeId;
        }
        if ($date) {
            $conditions[] = "DATE(t.timestamp) = ?";
            $params[] = $date;
        }

        if (count($conditions) > 0) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $sql .= " ORDER BY t.timestamp DESC LIMIT 100";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO time_entries (employeeId, action, timestamp) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute([
                $data['employeeId'],
                $data['action'],
                $data['timestamp'] ?? date('Y-m-d H:i:s')
            ]);
            echo json_encode(["message" => "Time entry recorded"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE time_entries SET employeeId=?, action=?, timestamp=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $data['employeeId'],
                $data['action'],
                $data['timestamp'], // Must be provided
                $data['id']
            ]);
            echo json_encode(["message" => "Time entry updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $pdo->prepare("DELETE FROM time_entries WHERE id=?")->execute([$id]);
            echo json_encode(["message" => "Time entry deleted"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}

?>
