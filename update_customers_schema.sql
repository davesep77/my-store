-- Update Customers Table with fields from the selection screen
SET @dbname = DATABASE();

SET @tablename = "customers";

-- Helper procedure to add column if it doesn't exist
DROP PROCEDURE IF EXISTS AddCustCol;

DELIMITER / /

CREATE PROCEDURE AddCustCol(
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

-- Add new columns based on screenshot
CALL AddCustCol ( 'customers', 'customerNumber', 'VARCHAR(50)' );

CALL AddCustCol ( 'customers', 'company', 'VARCHAR(100)' );

CALL AddCustCol ( 'customers', 'zipCode', 'VARCHAR(20)' );

CALL AddCustCol ( 'customers', 'city', 'VARCHAR(100)' );

CALL AddCustCol ( 'customers', 'state', 'VARCHAR(50)' );

-- Cleanup
DROP PROCEDURE AddCustCol;