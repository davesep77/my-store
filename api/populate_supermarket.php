<?php
// api/populate_supermarket.php
require_once 'db.php';

try {
    // 1. Create Departments Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        description TEXT
    )");

    // 2. Add departmentId to items if not exists
    $stmt = $pdo->query("SHOW COLUMNS FROM items LIKE 'departmentId'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE items ADD COLUMN departmentId VARCHAR(50)");
        $pdo->exec("ALTER TABLE items ADD CONSTRAINT fk_items_department FOREIGN KEY (departmentId) REFERENCES departments(id)");
    }

    // 4. Define Data
    $departments = [
        'DEPT-001' => ['Produce', 'Fresh fruits and vegetables'],
        'DEPT-002' => ['Bakery', 'Freshly baked bread and pastries'],
        'DEPT-003' => ['Meat & Seafood', 'Fresh meat, poultry, and seafood'],
        'DEPT-004' => ['Dairy & Eggs', 'Milk, cheese, yogurt, and eggs'],
        'DEPT-005' => ['Frozen Foods', 'Ice cream, frozen meals, vegetables'],
        'DEPT-006' => ['Pantry', 'Canned goods, pasta, rice, baking supplies'],
        'DEPT-007' => ['Beverages', 'Water, soda, juice, coffee, tea'],
        'DEPT-008' => ['Snacks', 'Chips, crackers, cookies, candy'],
        'DEPT-009' => ['Household', 'Cleaning supplies, paper goods, laundry'],
        'DEPT-010' => ['Personal Care', 'Shampoo, soap, toothpaste, pharmacy']
    ];

    foreach ($departments as $id => $info) {
        $stmt = $pdo->prepare("INSERT INTO departments (id, name, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)");
        $stmt->execute([$id, $info[0], $info[1]]);
    }

    $items = [
        // Produce
        ['PROD-001', 'Bananas', 0.69, 0.99, 'DEPT-001', 500],
        ['PROD-002', 'Red Apples (lb)', 1.20, 1.99, 'DEPT-001', 300],
        ['PROD-003', 'Carrots (Bag)', 0.80, 1.49, 'DEPT-001', 100],
        ['PROD-004', 'Potatoes (5lb)', 2.50, 3.99, 'DEPT-001', 80],
        ['PROD-005', 'Onions (3lb)', 1.50, 2.49, 'DEPT-001', 80],
        ['PROD-006', 'Tomatoes (lb)', 1.80, 2.99, 'DEPT-001', 60],
        ['PROD-007', 'Lettuce (Head)', 1.00, 1.79, 'DEPT-001', 50],
        ['PROD-008', 'Broccoli (Crown)', 1.20, 1.99, 'DEPT-001', 40],
        ['PROD-009', 'Cucumber', 0.50, 0.89, 'DEPT-001', 60],
        ['PROD-010', 'Avocado', 1.00, 1.50, 'DEPT-001', 100],
        ['PROD-011', 'Spinach (Bag)', 1.50, 2.49, 'DEPT-001', 40],
        ['PROD-012', 'Strawberries (Pack)', 2.50, 3.99, 'DEPT-001', 50],
        ['PROD-013', 'Blueberries (Pack)', 3.00, 4.99, 'DEPT-001', 40],
        ['PROD-014', 'Grapes (lb)', 2.00, 3.49, 'DEPT-001', 60],
        ['PROD-015', 'Oranges (lb)', 1.10, 1.69, 'DEPT-001', 80],

        // Bakery
        ['BAKE-001', 'Sourdough Bread', 2.50, 4.99, 'DEPT-002', 30],
        ['BAKE-002', 'Whole Wheat Bread', 2.00, 3.99, 'DEPT-002', 40],
        ['BAKE-003', 'Bagels (6 Pack)', 2.50, 4.49, 'DEPT-002', 25],
        ['BAKE-004', 'Croissants (4 Pack)', 3.00, 5.99, 'DEPT-002', 20],
        ['BAKE-005', 'Muffins (4 Pack)', 3.50, 6.49, 'DEPT-002', 20],
        ['BAKE-006', 'Chocolate Chip Cookies (12)', 3.00, 5.49, 'DEPT-002', 30],
        ['BAKE-007', 'Donuts (Dozen)', 4.00, 7.99, 'DEPT-002', 15],
        ['BAKE-008', 'French Baguette', 1.50, 2.99, 'DEPT-002', 40],

        // Meat & Seafood
        ['MEAT-001', 'Ground Beef (lb)', 4.00, 5.99, 'DEPT-003', 50],
        ['MEAT-002', 'Chicken Breast (lb)', 3.00, 4.99, 'DEPT-003', 60],
        ['MEAT-003', 'Pork Chops (lb)', 3.50, 5.49, 'DEPT-003', 40],
        ['MEAT-004', 'Bacon (Pack)', 4.50, 6.99, 'DEPT-003', 50],
        ['MEAT-005', 'Salmon Fillet (lb)', 8.00, 12.99, 'DEPT-003', 30],
        ['MEAT-006', 'Shrimp (Bag)', 9.00, 14.99, 'DEPT-003', 25],
        ['MEAT-007', 'Steak (Ribeye)', 12.00, 18.99, 'DEPT-003', 20],
        ['MEAT-008', 'Sausages (Pack)', 3.50, 5.99, 'DEPT-003', 40],

        // Dairy & Eggs
        ['DAIRY-001', 'Whole Milk (Gallon)', 2.50, 3.99, 'DEPT-004', 60],
        ['DAIRY-002', '2% Milk (Gallon)', 2.50, 3.99, 'DEPT-004', 60],
        ['DAIRY-003', 'Eggs (Large Dozen)', 2.00, 3.49, 'DEPT-004', 100],
        ['DAIRY-004', 'Butter (Sticks)', 3.00, 4.99, 'DEPT-004', 50],
        ['DAIRY-005', 'Cheddar Cheese (Block)', 2.50, 4.49, 'DEPT-004', 40],
        ['DAIRY-006', 'Yogurt (Cup)', 0.60, 1.00, 'DEPT-004', 100],
        ['DAIRY-007', 'Greek Yogurt (Tub)', 3.50, 5.99, 'DEPT-004', 30],
        ['DAIRY-008', 'Cream Cheese', 2.00, 3.49, 'DEPT-004', 40],

        // Frozen
        ['FROZ-001', 'Vanilla Ice Cream', 3.00, 4.99, 'DEPT-005', 40],
        ['FROZ-002', 'Frozen Pizza', 3.50, 6.99, 'DEPT-005', 50],
        ['FROZ-003', 'Frozen Mixed Veggies', 1.50, 2.49, 'DEPT-005', 60],
        ['FROZ-004', 'Frozen Waffles', 2.00, 3.49, 'DEPT-005', 40],
        ['FROZ-005', 'Chicken Nuggets', 4.00, 6.99, 'DEPT-005', 30],

        // Pantry
        ['PANT-001', 'Pasta (Spaghetti)', 0.80, 1.49, 'DEPT-006', 100],
        ['PANT-002', 'Marinara Sauce', 1.50, 2.99, 'DEPT-006', 80],
        ['PANT-003', 'Rice (5lb Bag)', 3.00, 5.99, 'DEPT-006', 60],
        ['PANT-004', 'Canned Beans', 0.60, 0.99, 'DEPT-006', 120],
        ['PANT-005', 'Canned Soup', 1.20, 2.29, 'DEPT-006', 100],
        ['PANT-006', 'Flour (5lb)', 2.50, 3.99, 'DEPT-006', 50],
        ['PANT-007', 'Sugar (4lb)', 2.50, 3.99, 'DEPT-006', 50],
        ['PANT-008', 'Vegetable Oil', 3.00, 4.99, 'DEPT-006', 40],
        ['PANT-009', 'Cereal (Box)', 3.00, 5.49, 'DEPT-006', 60],
        ['PANT-010', 'Peanut Butter', 2.50, 4.49, 'DEPT-006', 50],

        // Beverages
        ['BEV-001', 'Spring Water (24pk)', 3.00, 4.99, 'DEPT-007', 100],
        ['BEV-002', 'Cola (12pk)', 4.00, 6.99, 'DEPT-007', 60],
        ['BEV-003', 'Orange Juice', 3.00, 5.49, 'DEPT-007', 40],
        ['BEV-004', 'Coffee (Ground)', 6.00, 9.99, 'DEPT-007', 40],
        ['BEV-005', 'Green Tea (Box)', 2.50, 3.99, 'DEPT-007', 50],

        // Household
        ['HOUSE-001', 'Paper Towels (6 Rolls)', 6.00, 10.99, 'DEPT-009', 40],
        ['HOUSE-002', 'Toilet Paper (12 Rolls)', 6.00, 10.99, 'DEPT-009', 40],
        ['HOUSE-003', 'Laundry Detergent', 8.00, 14.99, 'DEPT-009', 30],
        ['HOUSE-004', 'Dish Soap', 2.00, 3.49, 'DEPT-009', 60],
        ['HOUSE-005', 'Trash Bags', 5.00, 8.99, 'DEPT-009', 40],

        // Personal Care
        ['CARE-001', 'Shampoo', 4.00, 6.99, 'DEPT-010', 40],
        ['CARE-002', 'Body Wash', 3.50, 5.99, 'DEPT-010', 40],
        ['CARE-003', 'Toothpaste', 2.00, 3.99, 'DEPT-010', 60],
        ['CARE-004', 'Deodorant', 3.00, 5.49, 'DEPT-010', 50],
        ['CARE-005', 'Hand Soap', 1.50, 2.99, 'DEPT-010', 60],
        
        // User requested/hinted item (Simulating a specific item 346)
        ['346', 'Test Item 346', 10.00, 15.00, 'DEPT-009', 100]
    ];

    $insertStmt = $pdo->prepare("INSERT INTO items (id, sku, name, unitCost, sellingPrice, departmentId, stock, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), unitCost=VALUES(unitCost), sellingPrice=VALUES(sellingPrice), departmentId=VALUES(departmentId), stock=VALUES(stock), stockAlertLevel=5");

    foreach ($items as $item) {
        // ID is random hash or SKU based? Let's use SKU as ID for simplicity or generate one.
        // The table uses ID VARCHAR(50).
        // Let's generate a unique ID based on SKU to update if exists.
        $id = md5($item[0]); 
        
        $insertStmt->execute([
            $id, 
            $item[0], // SKU
            $item[1], // Name
            $item[2], // Cost
            $item[3], // Price
            $item[4], // Dept ID
            $item[5]  // Stock
        ]);
    }

    echo json_encode(["message" => "Successfully populated supermarket items", "count" => count($items)]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
