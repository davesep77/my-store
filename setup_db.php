<?php
$servername = "localhost";
$username = "root";
$password = ""; // Default XAMPP password

// Create connection
$conn = new mysqli($servername, $username, $password, "", 3310);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "<br>Note: If you have a password set for root, please edit this file and add it.");
}

$sqlFile = 'database_setup.sql';
if (!file_exists($sqlFile)) {
    die("Error: database_setup.sql not found.");
}

$sql = file_get_contents($sqlFile);

// Execute multi query
if ($conn->multi_query($sql)) {
    do {
        // Store first result set
        if ($result = $conn->store_result()) {
            $result->free();
        }
    } while ($conn->more_results() && $conn->next_result());
    echo "Database created and data migrated successfully!";
} else {
    echo "Error executing SQL: " . $conn->error;
}

$conn->close();
?>
