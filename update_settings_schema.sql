SET @dbname = DATABASE();

SET @tablename = "settings";

DROP PROCEDURE IF EXISTS AddSettingsCol;

DELIMITER / /

CREATE PROCEDURE AddSettingsCol(
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

CALL AddSettingsCol ( 'settings', 'invoiceHeader', 'TEXT' );

CALL AddSettingsCol ( 'settings', 'invoiceFooter', 'TEXT' );

CALL AddSettingsCol (
    'settings',
    'nextInvoiceNumber',
    'INT DEFAULT 1000'
);

CALL AddSettingsCol ( 'settings', 'invoiceTerms', 'TEXT' );

CALL AddSettingsCol (
    'settings',
    'taxRate',
    'DECIMAL(5,2) DEFAULT 0.00'
);

DROP PROCEDURE AddSettingsCol;