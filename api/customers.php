<?php
// api/customers.php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$table = 'customers';

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM $table ORDER BY lastName ASC, firstName ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['firstName']) || !isset($data['lastName'])) { 
            http_response_code(400); 
            echo json_encode(["error" => "Name is required"]); 
            exit; 
        }
        
        $sql = "INSERT INTO $table (
            id, customerNumber, firstName, lastName, company, email, phone, address, city, state, zipCode, notes, dateAdded
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            $pdo->prepare($sql)->execute([
                $data['id'] ?? uniqid(),
                $data['customerNumber'] ?? '',
                $data['firstName'],
                $data['lastName'],
                $data['company'] ?? '',
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['state'] ?? '',
                $data['zipCode'] ?? '',
                $data['notes'] ?? '',
                $data['dateAdded'] ?? date('Y-m-d')
            ]);
            http_response_code(201); 
            echo json_encode(["message" => "Created", "id" => $data['id']]);
        } catch (PDOException $e) { 
            http_response_code(500); 
            echo json_encode(["error" => $e->getMessage()]); 
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) { http_response_code(400); echo json_encode(["error" => "ID required"]); exit; }

        $fields = [
            'customerNumber', 'firstName', 'lastName', 'company', 'email', 'phone', 
            'address', 'city', 'state', 'zipCode', 'notes'
        ];
        
        $setParams = [];
        $values = [];
        foreach ($fields as $field) {
            $setParams[] = "$field = ?";
            $values[] = $data[$field] ?? '';
        }
        $values[] = $data['id'];

        $sql = "UPDATE $table SET " . implode(', ', $setParams) . " WHERE id = ?";
        
        try {
            $pdo->prepare($sql)->execute($values);
            echo json_encode(["message" => "Updated"]);
        } catch (PDOException $e) { 
            http_response_code(500); 
            echo json_encode(["error" => $e->getMessage()]); 
        }
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
