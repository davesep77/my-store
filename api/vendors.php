<?php
// api/vendors.php
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
$table = 'vendors';

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM $table ORDER BY companyName ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id'])) { http_response_code(400); echo json_encode(["error" => "Invalid data"]); exit; }
        
        $sql = "INSERT INTO $table (
            id, vendorNumber, companyName, poDeliveryMethod, terms, flatRentRate, taxId, 
            minOrder, commissionPercent, billableDepartment, socialSecurityNumber,
            address1, address2, city, state, zip, country, address,
            contactFirstName, contactLastName, contactPerson, phone, fax, email, website
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            $pdo->prepare($sql)->execute([
                $data['id'],
                $data['vendorNumber'] ?? '',
                $data['companyName'],
                $data['poDeliveryMethod'] ?? 'Print',
                $data['terms'] ?? '',
                $data['flatRentRate'] ?? 0.00,
                $data['taxId'] ?? '',
                $data['minOrder'] ?? 0.00,
                $data['commissionPercent'] ?? 0.00,
                $data['billableDepartment'] ?? '',
                $data['socialSecurityNumber'] ?? '',
                $data['address1'] ?? '',
                $data['address2'] ?? '',
                $data['city'] ?? '',
                $data['state'] ?? '',
                $data['zip'] ?? '',
                $data['country'] ?? '',
                $data['address'] ?? '', // legacy
                $data['contactFirstName'] ?? '',
                $data['contactLastName'] ?? '',
                $data['contactPerson'] ?? '', // legacy
                $data['phone'] ?? '',
                $data['fax'] ?? '',
                $data['email'] ?? '',
                $data['website'] ?? ''
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
            'vendorNumber', 'companyName', 'poDeliveryMethod', 'terms', 'flatRentRate', 'taxId',
            'minOrder', 'commissionPercent', 'billableDepartment', 'socialSecurityNumber',
            'address1', 'address2', 'city', 'state', 'zip', 'country', 'address',
            'contactFirstName', 'contactLastName', 'contactPerson', 'phone', 'fax', 'email', 'website'
        ];
        
        $setParams = [];
        $values = [];
        foreach ($fields as $field) {
            $setParams[] = "$field = ?";
            $values[] = $data[$field] ?? ($field === 'flatRentRate' || $field === 'minOrder' || $field === 'commissionPercent' ? 0 : '');
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
