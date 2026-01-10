<?php
// api/departments.php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$table = 'departments';

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM $table ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) {
            http_response_code(400); echo json_encode(["error" => "Invalid data"]); exit;
        }
        $sql = "INSERT INTO $table (id, name, description) VALUES (?, ?, ?)";
        try {
            $pdo->prepare($sql)->execute([$data['id'], $data['name'], $data['description'] ?? '']);
            http_response_code(201); echo json_encode(["message" => "Created", "id" => $data['id']]);
        } catch (PDOException $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) { http_response_code(400); echo json_encode(["error" => "ID required"]); exit; }
        $sql = "UPDATE $table SET name=?, description=? WHERE id=?";
        try {
            $pdo->prepare($sql)->execute([$data['name'], $data['description'] ?? '', $data['id']]);
            echo json_encode(["message" => "Updated"]);
        } catch (PDOException $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); echo json_encode(["error" => "ID required"]); exit; }
        try {
            $pdo->prepare("DELETE FROM $table WHERE id=?")->execute([$id]);
            echo json_encode(["message" => "Deleted"]);
        } catch (PDOException $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
        break;
}
?>
