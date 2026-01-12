<?php
// Simple test script to verify register endpoint locally
$url = 'http://localhost/my-store-inventory-manager%20(1)/api/register.php';
$data = ['username' => 'test_local_' . time(), 'password' => 'pass123', 'fullName' => 'Test Local', 'email' => 'test@local.com', 'country' => 'US'];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "Error contacting API\n";
} else {
    echo "API Response: " . $result . "\n";
}
?>
