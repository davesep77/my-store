<?php
// api/import_image_items.php
require_once 'db.php';

try {
    // 1. Create New Departments
    $newDepartments = [
        'DEPT-011' => ['Skincare & Beauty', 'Cosmetics, lotions, and facial care'],
        'DEPT-012' => ['Baby & Kids', 'Formula, baby food, and accessories']
    ];

    $deptStmt = $pdo->prepare("INSERT INTO departments (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)");
    
    foreach ($newDepartments as $id => $info) {
        $deptStmt->execute([$id, $info[0], $info[1]]);
    }

    // 2. Define Items from Image
    // Structure: [Name, Price, DeptID]
    // Unit Cost will be estimated as 70% of Selling Price
    $items = [
        // Skincare / Beauty (DEPT-011)
        ['COSRX Advanced Snail Cleanser Gel', 2350, 'DEPT-011'],
        ['Olaplex No 7', 3400, 'DEPT-011'],
        ['Rice Toner 150ml', 2700, 'DEPT-011'],
        ['COSRX Mucin Essence 100ml', 2100, 'DEPT-011'],
        ['Tranexamic 5%', 3150, 'DEPT-011'],
        ['Mandelic 12%', 3150, 'DEPT-011'],
        ['COSRX Intensive Cream', 2200, 'DEPT-011'],
        ['Vitamin C 23', 2300, 'DEPT-011'],
        ['Mary Ruth', 4350, 'DEPT-011'],
        ['Victoria Lotion', 2000, 'DEPT-011'],
        ['Victoria Spray', 2000, 'DEPT-011'],
        ['CeraVe AM', 2000, 'DEPT-011'],
        ['CeraVe PM', 2000, 'DEPT-011'],
        ['CeraVe Cream', 4850, 'DEPT-011'],
        ['CeraVe Hydrating Facial Cleanser 355ml', 2450, 'DEPT-011'],
        ['CeraVe SA Renewing Cleanser 237ml', 2250, 'DEPT-011'],
        ['CeraVe SA Renewing Cleanser 473ml', 2700, 'DEPT-011'],
        ['CeraVe Foaming Cleanser 355ml', 2400, 'DEPT-011'],
        ['Nordic', 3900, 'DEPT-011'], // Likely Nordic Naturals supplements

        // Baby & Kids (DEPT-012)
        ['Mustela 500ml', 2650, 'DEPT-012'],
        ['Cetaphil Baby', 1875, 'DEPT-012'],
        ['Avent Anti Colic', 2500, 'DEPT-012'],
        ['Enfamil Yellow', 8850, 'DEPT-012'],
        ['Enfamil Purple', 9400, 'DEPT-012'],
        ['Nido', 5100, 'DEPT-012'],
        ['Similac Sensitive 352', 3300, 'DEPT-012'],
        ['Gerber Baby Cereal', 1200, 'DEPT-012'],

        // Pantry (DEPT-006)
        ['Morton Salt 2 Pack', 2850, 'DEPT-006'],
        ['Sodium Free Salt 408g', 3180, 'DEPT-006'],
        ['Splenda Sugar', 2850, 'DEPT-006'],
        ['Gluten Free Cupcake', 1400, 'DEPT-006'],
        ['Gluten Free Pancake', 1400, 'DEPT-006'],
        ['Chickpea Pasta', 1400, 'DEPT-006'],
        ['Rice', 2000, 'DEPT-006'],
        ['Pasta & Cheese', 1400, 'DEPT-006'],
        ['Bread Crumb', 1300, 'DEPT-006']
    ];

    $insertStmt = $pdo->prepare("INSERT INTO items (id, sku, name, unitCost, sellingPrice, departmentId, stock, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), unitCost=VALUES(unitCost), sellingPrice=VALUES(sellingPrice), departmentId=VALUES(departmentId)");

    foreach ($items as $item) {
        $name = $item[0];
        $price = $item[1];
        $deptId = $item[2];
        
        // Generate a SKU based on Name acronym + random number or hash
        // Using hash for uniqueness
        $sku = strtoupper(substr(md5($name), 0, 8)); 
        $id = md5($name);
        
        // Estimate Cost
        $cost = $price * 0.70;
        
        // Default Stock
        $stock = 50;

        $insertStmt->execute([
            $id,
            $sku,
            $name,
            $cost,
            $price,
            $deptId,
            $stock
        ]);
    }

    echo json_encode(["message" => "Successfully imported items from image list", "count" => count($items)]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
