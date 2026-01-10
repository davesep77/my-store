-- Update Vendors Table with detailed fields from the user's screenshot
SET @dbname = DATABASE();

SET @tablename = "vendors";

-- Helper procedure to add column if it doesn't exist
DROP PROCEDURE IF EXISTS AddCol;

DELIMITER / /

CREATE PROCEDURE AddCol(
    IN tblName VARCHAR(64),
    IN colName VARCHAR(64),
    IN colDef VARCHAR(255)
)
BEGIN
    IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tblName AND COLUMN_NAME = colName) = 0 THEN
        SET @ddl = CONCAT('ALTER TABLE ', tblName, ' ADD COLUMN ', colName, ' ', colDef);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER;

-- Add new columns
CALL AddCol ( 'vendors', 'vendorNumber', 'VARCHAR(50)' );

CALL AddCol (
    'vendors',
    'poDeliveryMethod',
    'VARCHAR(50) DEFAULT "Print"'
);

CALL AddCol ( 'vendors', 'terms', 'VARCHAR(50)' );

CALL AddCol (
    'vendors',
    'flatRentRate',
    'DECIMAL(10, 2) DEFAULT 0.00'
);

CALL AddCol ( 'vendors', 'taxId', 'VARCHAR(50)' );

CALL AddCol ( 'vendors', 'minOrder', 'DECIMAL(10, 2) DEFAULT 0.00' );

CALL AddCol (
    'vendors',
    'commissionPercent',
    'DECIMAL(5, 2) DEFAULT 0.00'
);

CALL AddCol ( 'vendors', 'billableDepartment', 'VARCHAR(100)' );

CALL AddCol ( 'vendors', 'socialSecurityNumber', 'VARCHAR(50)' );

-- Address Fields (Splitting the single 'address' field)
CALL AddCol ( 'vendors', 'address1', 'VARCHAR(255)' );

CALL AddCol ( 'vendors', 'address2', 'VARCHAR(255)' );

CALL AddCol ( 'vendors', 'city', 'VARCHAR(100)' );

CALL AddCol ( 'vendors', 'state', 'VARCHAR(50)' );

CALL AddCol ( 'vendors', 'zip', 'VARCHAR(20)' );

CALL AddCol ( 'vendors', 'country', 'VARCHAR(100)' );

-- Contact Info Split
CALL AddCol ( 'vendors', 'contactFirstName', 'VARCHAR(100)' );

CALL AddCol ( 'vendors', 'contactLastName', 'VARCHAR(100)' );

CALL AddCol ( 'vendors', 'fax', 'VARCHAR(50)' );

-- Cleanup
DROP PROCEDURE AddCol;