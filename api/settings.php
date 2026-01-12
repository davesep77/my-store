<?php
// api/settings.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM settings LIMIT 1");
        $settings = $stmt->fetch();
        if (!$settings) {
             // Return defaults if not found
             echo json_encode([
                 "currency" => "GBP",
                 "locale" => "en-GB",
                 "dateFormat" => "DD/MM/YYYY",
                 "email" => "admin@mystore.com",
                 "invoiceHeader" => "",
                 "invoiceFooter" => "",
                 "nextInvoiceNumber" => 1000,
                 "invoiceTerms" => "",
                 "taxRate" => 0.00,
                 "subscriptionPlan" => "starter",
                 "billingCycle" => "monthly",
                 "subscriptionStatus" => "inactive" // Default to inactive for new users
             ]);
        } else {
             // Cast numbers
             $settings['nextInvoiceNumber'] = (int)$settings['nextInvoiceNumber'];
             $settings['taxRate'] = (float)$settings['taxRate'];
             echo json_encode($settings);
        }
        break;

    case 'POST': // Or PUT
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Check if settings exist
        $check = $pdo->query("SELECT id FROM settings LIMIT 1")->fetch();

        if ($check) {
            $sql = "UPDATE settings SET currency=?, locale=?, dateFormat=?, email=?, invoiceHeader=?, invoiceFooter=?, nextInvoiceNumber=?, invoiceTerms=?, taxRate=?, subscriptionPlan=?, billingCycle=?, subscriptionStatus=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            try {
                $stmt->execute([
                    $data['currency'], 
                    $data['locale'], 
                    $data['dateFormat'], 
                    $data['email'],
                    $data['invoiceHeader'] ?? '',
                    $data['invoiceFooter'] ?? '',
                    $data['nextInvoiceNumber'] ?? 1000,
                    $data['invoiceTerms'] ?? '',
                    $data['taxRate'] ?? 0.00,
                    $data['subscriptionPlan'] ?? 'starter',
                    $data['billingCycle'] ?? 'monthly',
                    $data['subscriptionStatus'] ?? 'active', // If updating, usually means they are active or keeping status. Let's assume active if not specified, or trust frontend.
                    $check['id']
                ]);
                echo json_encode(["message" => "Settings updated"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        } else {
            $sql = "INSERT INTO settings (currency, locale, dateFormat, email, invoiceHeader, invoiceFooter, nextInvoiceNumber, invoiceTerms, taxRate, subscriptionPlan, billingCycle, subscriptionStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            try {
                $stmt->execute([
                    $data['currency'], 
                    $data['locale'], 
                    $data['dateFormat'], 
                    $data['email'],
                    $data['invoiceHeader'] ?? '',
                    $data['invoiceFooter'] ?? '',
                    $data['nextInvoiceNumber'] ?? 1000,
                    $data['invoiceTerms'] ?? '',
                    $data['taxRate'] ?? 0.00,
                    $data['subscriptionPlan'] ?? 'starter',
                    $data['billingCycle'] ?? 'monthly',
                    $data['subscriptionStatus'] ?? 'inactive' // Default to inactive for new inserts
                ]);
                echo json_encode(["message" => "Settings created"]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;
}
?>
