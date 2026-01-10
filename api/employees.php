<?php
// api/employees.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM employees ORDER BY lastName, firstName");
            $employees = $stmt->fetchAll();
            // Boolean conversion
            foreach($employees as &$emp) {
                $emp['isActive'] = (bool)$emp['isActive'];
                $emp['hourlyRate'] = (float)$emp['hourlyRate'];
            }
            echo json_encode($employees);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO employees (id, firstName, lastName, email, phone, address, role, pinCode, hourlyRate, startDate, isActive) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute([
                $data['id'],
                $data['firstName'],
                $data['lastName'],
                $data['email'] ?? null,
                $data['phone'] ?? null,
                $data['address'] ?? null,
                $data['role'] ?? 'Staff',
                $data['pinCode'] ?? null,
                $data['hourlyRate'] ?? 0,
                $data['startDate'] ?? null,
                isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1
            ]);
            echo json_encode(["message" => "Employee created", "id" => $data['id']]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE employees SET firstName=?, lastName=?, email=?, phone=?, address=?, role=?, pinCode=?, hourlyRate=?, startDate=?, isActive=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        try {
             $stmt->execute([
                $data['firstName'],
                $data['lastName'],
                $data['email'] ?? null,
                $data['phone'] ?? null,
                $data['address'] ?? null,
                $data['role'] ?? 'Staff',
                $data['pinCode'] ?? null,
                $data['hourlyRate'] ?? 0,
                $data['startDate'] ?? null,
                isset($data['isActive']) ? ($data['isActive'] ? 1 : 0) : 1,
                $data['id']
            ]);
            echo json_encode(["message" => "Employee updated"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $pdo->prepare("DELETE FROM employees WHERE id=?")->execute([$id]);
            echo json_encode(["message" => "Employee deleted"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
