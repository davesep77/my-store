CREATE DATABASE IF NOT EXISTS store_inventory;

USE store_inventory;

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    currency VARCHAR(10) DEFAULT 'GBP',
    locale VARCHAR(10) DEFAULT 'en-GB',
    dateFormat VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    email VARCHAR(100) DEFAULT 'admin@mystore.com'
);

INSERT INTO
    settings (
        id,
        currency,
        locale,
        dateFormat,
        email
    )
VALUES (
        1,
        'GBP',
        'en-GB',
        'DD/MM/YYYY',
        'admin@mystore.com'
    )
ON DUPLICATE KEY UPDATE
    email = VALUES(email);

-- Items Table
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50),
    name VARCHAR(255),
    stock INT,
    unitCost DECIMAL(10, 2),
    sellingPrice DECIMAL(10, 2),
    stockAlertLevel INT,
    remarks TEXT,
    dateAdded DATE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    batchId VARCHAR(50),
    date DATE,
    type ENUM('sale', 'purchase', 'opening'),
    itemId VARCHAR(50),
    quantity INT,
    unitPrice DECIMAL(10, 2),
    remarks TEXT,
    FOREIGN KEY (itemId) REFERENCES items (id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    fullName VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'manager'
);

-- Insert Default Admin User
INSERT INTO
    users (
        id,
        username,
        password,
        fullName,
        email,
        role
    )
VALUES (
        '1',
        'dave',
        '#d0911136479E',
        'Dave Admin',
        'dave@mystore.com',
        'admin'
    )
ON DUPLICATE KEY UPDATE
    password = VALUES(password);

-- Clear existing data if any (only for items/transactions)
DELETE FROM transactions;

DELETE FROM items;

-- Insert Items
INSERT INTO
    items (
        id,
        sku,
        name,
        stock,
        unitCost,
        sellingPrice,
        stockAlertLevel,
        remarks,
        dateAdded
    )
VALUES (
        '11',
        'WC-001',
        'Wall Clock',
        15,
        600,
        850,
        5,
        'Silent, 12-inch',
        '2024-01-10'
    ),
    (
        '10',
        'EP-002',
        'Earphones',
        45,
        150,
        280,
        10,
        'Wired, 3.5mm',
        '2024-01-15'
    ),
    (
        '9',
        'DO-003',
        'Desk Organizer',
        32,
        400,
        580,
        5,
        'Wooden, 5 slots',
        '2024-02-05'
    ),
    (
        '8',
        'PC-004',
        'Phone Charger',
        55,
        200,
        350,
        15,
        '20W, USB-C',
        '2024-02-12'
    ),
    (
        '7',
        'BP-005',
        'Ballpoint Pens',
        180,
        50,
        95,
        20,
        'Pack of 10',
        '2024-03-01'
    ),
    (
        '6',
        'BK-006',
        'Backpack',
        22,
        1000,
        1450,
        5,
        '15L, Waterproof',
        '2024-03-20'
    ),
    (
        '5',
        'FD-007',
        'USB Flash Drive',
        28,
        250,
        420,
        10,
        '64GB Extreme',
        '2024-04-05'
    ),
    (
        '4',
        'NB-008',
        'Notebook Set',
        90,
        80,
        150,
        15,
        'A5, 100 pages',
        '2024-04-15'
    ),
    (
        '3',
        'WM-009',
        'Wireless Mouse',
        42,
        300,
        480,
        10,
        'Optical, 2.4Ghz',
        '2024-05-01'
    ),
    (
        '12',
        'DL-010',
        'LED Desk Lamp',
        12,
        1200,
        1850,
        3,
        'Dimmable, USB port',
        '2024-05-15'
    ),
    (
        '13',
        'BS-011',
        'Bluetooth Speaker',
        8,
        2500,
        3950,
        5,
        'Portable, IPX7',
        '2024-06-01'
    );

-- Insert Opening Transactions
INSERT INTO
    transactions (
        id,
        date,
        type,
        itemId,
        quantity,
        unitPrice,
        remarks
    )
VALUES (
        'opening-11',
        '2024-01-10',
        'opening',
        '11',
        15,
        600,
        'Initial stock load'
    ),
    (
        'opening-10',
        '2024-01-15',
        'opening',
        '10',
        45,
        150,
        'Initial stock load'
    ),
    (
        'opening-9',
        '2024-02-05',
        'opening',
        '9',
        32,
        400,
        'Initial stock load'
    ),
    (
        'opening-8',
        '2024-02-12',
        'opening',
        '8',
        55,
        200,
        'Initial stock load'
    ),
    (
        'opening-7',
        '2024-03-01',
        'opening',
        '7',
        180,
        50,
        'Initial stock load'
    ),
    (
        'opening-6',
        '2024-03-20',
        'opening',
        '6',
        22,
        1000,
        'Initial stock load'
    ),
    (
        'opening-5',
        '2024-04-05',
        'opening',
        '5',
        28,
        250,
        'Initial stock load'
    ),
    (
        'opening-4',
        '2024-04-15',
        'opening',
        '4',
        90,
        80,
        'Initial stock load'
    ),
    (
        'opening-3',
        '2024-05-01',
        'opening',
        '3',
        42,
        300,
        'Initial stock load'
    ),
    (
        'opening-12',
        '2024-05-15',
        'opening',
        '12',
        12,
        1200,
        'Initial stock load'
    ),
    (
        'opening-13',
        '2024-06-01',
        'opening',
        '13',
        8,
        2500,
        'Initial stock load'
    );

-- Insert Transactions
INSERT INTO
    transactions (
        id,
        date,
        type,
        itemId,
        quantity,
        unitPrice,
        remarks
    )
VALUES (
        't1',
        '2024-01-20',
        'sale',
        '11',
        2,
        850,
        'Local sale'
    ),
    (
        't2',
        '2024-01-25',
        'purchase',
        '10',
        20,
        150,
        'Restock'
    ),
    (
        't3',
        '2024-02-15',
        'sale',
        '10',
        15,
        280,
        NULL
    ),
    (
        't4',
        '2024-02-28',
        'sale',
        '9',
        5,
        580,
        NULL
    ),
    (
        't5',
        '2024-03-10',
        'purchase',
        '8',
        30,
        200,
        NULL
    ),
    (
        't6',
        '2024-03-25',
        'sale',
        '8',
        12,
        350,
        NULL
    ),
    (
        't7',
        '2024-04-10',
        'sale',
        '7',
        50,
        95,
        NULL
    ),
    (
        't8',
        '2024-04-22',
        'sale',
        '6',
        3,
        1450,
        NULL
    ),
    (
        't9',
        '2024-05-05',
        'purchase',
        '12',
        10,
        1200,
        NULL
    ),
    (
        't10',
        '2024-05-18',
        'sale',
        '12',
        2,
        1850,
        NULL
    ),
    (
        't11',
        '2024-06-12',
        'sale',
        '13',
        1,
        3950,
        NULL
    ),
    (
        't12',
        '2024-06-25',
        'sale',
        '5',
        10,
        420,
        NULL
    ),
    (
        't13',
        '2024-07-08',
        'purchase',
        '4',
        50,
        80,
        NULL
    ),
    (
        't14',
        '2024-07-20',
        'sale',
        '4',
        30,
        150,
        NULL
    ),
    (
        't15',
        '2024-08-15',
        'sale',
        '3',
        10,
        480,
        NULL
    ),
    (
        't16',
        '2024-08-29',
        'sale',
        '11',
        3,
        850,
        NULL
    ),
    (
        't17',
        '2024-09-10',
        'purchase',
        '10',
        25,
        150,
        NULL
    ),
    (
        't18',
        '2024-09-25',
        'sale',
        '10',
        20,
        280,
        NULL
    ),
    (
        't19',
        '2024-10-05',
        'sale',
        '9',
        8,
        580,
        NULL
    ),
    (
        't20',
        '2024-10-22',
        'purchase',
        '6',
        5,
        1000,
        NULL
    ),
    (
        't21',
        '2024-11-12',
        'sale',
        '6',
        2,
        1450,
        NULL
    ),
    (
        't22',
        '2024-11-28',
        'sale',
        '8',
        15,
        350,
        NULL
    ),
    (
        't23',
        '2024-12-15',
        'sale',
        '7',
        80,
        95,
        'Holiday season sale'
    ),
    (
        't24',
        '2024-12-28',
        'sale',
        '13',
        2,
        3950,
        NULL
    ),
    (
        't25',
        '2025-01-10',
        'purchase',
        '5',
        40,
        250,
        NULL
    ),
    (
        't26',
        '2025-01-25',
        'sale',
        '5',
        15,
        420,
        NULL
    ),
    (
        't27',
        '2025-02-14',
        'sale',
        '4',
        25,
        150,
        NULL
    ),
    (
        't28',
        '2025-02-28',
        'sale',
        '3',
        12,
        480,
        NULL
    ),
    (
        't29',
        '2025-03-15',
        'purchase',
        '12',
        15,
        1200,
        NULL
    ),
    (
        't30',
        '2025-03-22',
        'sale',
        '12',
        8,
        1850,
        NULL
    ),
    (
        't31',
        '2025-04-05',
        'sale',
        '13',
        4,
        3950,
        NULL
    ),
    (
        't32',
        '2025-04-18',
        'purchase',
        '11',
        10,
        600,
        NULL
    ),
    (
        't33',
        '2025-05-10',
        'sale',
        '11',
        8,
        850,
        NULL
    ),
    (
        't34',
        '2025-05-25',
        'sale',
        '10',
        30,
        280,
        NULL
    ),
    (
        't35',
        '2025-06-02',
        'purchase',
        '9',
        20,
        400,
        NULL
    ),
    (
        't36',
        '2025-06-15',
        'sale',
        '9',
        15,
        580,
        NULL
    ),
    (
        't37',
        '2025-06-28',
        'sale',
        '8',
        25,
        350,
        NULL
    ),
    (
        't38',
        '2025-06-29',
        'sale',
        '13',
        2,
        3950,
        'Large order'
    );- -   U p d a t e   S c h e m a   w i t h   m i s s i n g   t a b l e s  
  
 - -   C u s t o m e r s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   c u s t o m e r s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         f i r s t N a m e   V A R C H A R ( 1 0 0 ) ,  
         l a s t N a m e   V A R C H A R ( 1 0 0 ) ,  
         e m a i l   V A R C H A R ( 1 0 0 ) ,  
         p h o n e   V A R C H A R ( 2 0 ) ,  
         c o m p a n y   V A R C H A R ( 1 0 0 ) ,  
         a d d r e s s   T E X T  
 ) ;  
  
 - -   V e n d o r s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   v e n d o r s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         n a m e   V A R C H A R ( 1 0 0 ) ,  
         c o n t a c t P e r s o n   V A R C H A R ( 1 0 0 ) ,  
         e m a i l   V A R C H A R ( 1 0 0 ) ,  
         p h o n e   V A R C H A R ( 2 0 ) ,  
         a d d r e s s   T E X T  
 ) ;  
  
 - -   E m p l o y e e s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   e m p l o y e e s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         f i r s t N a m e   V A R C H A R ( 1 0 0 ) ,  
         l a s t N a m e   V A R C H A R ( 1 0 0 ) ,  
         r o l e   V A R C H A R ( 5 0 ) ,  
         h o u r l y R a t e   D E C I M A L ( 1 0 ,   2 ) ,  
         p i n   V A R C H A R ( 1 0 )  
 ) ;  
  
 - -   T i m e   E n t r i e s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   t i m e _ e n t r i e s   (  
         i d   I N T   P R I M A R Y   K E Y   A U T O _ I N C R E M E N T ,  
         e m p l o y e e I d   V A R C H A R ( 5 0 ) ,  
         c l o c k I n   D A T E T I M E ,  
         c l o c k O u t   D A T E T I M E ,  
         F O R E I G N   K E Y   ( e m p l o y e e I d )   R E F E R E N C E S   e m p l o y e e s   ( i d )  
 ) ;  
  
 - -   S t y l e s   M a t r i x  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   s t y l e s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         n a m e   V A R C H A R ( 2 5 5 ) ,  
         b a s e I t e m I d   V A R C H A R ( 5 0 ) ,  
         F O R E I G N   K E Y   ( b a s e I t e m I d )   R E F E R E N C E S   i t e m s   ( i d )  
 ) ;  
  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   s t y l e _ v a r i a n t s   (  
         i d   I N T   P R I M A R Y   K E Y   A U T O _ I N C R E M E N T ,  
         s t y l e I d   V A R C H A R ( 5 0 ) ,  
         v a r i a n t N a m e   V A R C H A R ( 5 0 ) ,  
         v a r i a n t V a l u e   V A R C H A R ( 5 0 ) ,  
         s k u M o d i f i e r   V A R C H A R ( 5 0 ) ,  
         F O R E I G N   K E Y   ( s t y l e I d )   R E F E R E N C E S   s t y l e s   ( i d )  
 ) ;  
  
 - -   M i x   ' N   M a t c h   P r i c i n g  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   m i x _ m a t c h _ g r o u p s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         n a m e   V A R C H A R ( 2 5 5 ) ,  
         t y p e   E N U M ( ' q u a n t i t y ' ,   ' b o g o ' ) ,  
         q u a n t i t y N e e d e d   I N T ,  
         d i s c o u n t A m o u n t   D E C I M A L ( 1 0 ,   2 ) ,  
         d i s c o u n t T y p e   E N U M (  
                 ' f i x e d _ p r i c e ' ,  
                 ' p e r c e n t a g e _ o f f '  
         ) ,  
         s t a r t D a t e   D A T E ,  
         e n d D a t e   D A T E  
 ) ;  
  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   m i x _ m a t c h _ i t e m s   (  
         i d   I N T   P R I M A R Y   K E Y   A U T O _ I N C R E M E N T ,  
         g r o u p I d   V A R C H A R ( 5 0 ) ,  
         i t e m I d   V A R C H A R ( 5 0 ) ,  
         F O R E I G N   K E Y   ( g r o u p I d )   R E F E R E N C E S   m i x _ m a t c h _ g r o u p s   ( i d ) ,  
         F O R E I G N   K E Y   ( i t e m I d )   R E F E R E N C E S   i t e m s   ( i d )  
 ) ;  
  
 - -   C u s t o m e r   I t e m   P r i c e s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   c u s t o m e r _ i t e m _ p r i c e s   (  
         i d   I N T   P R I M A R Y   K E Y   A U T O _ I N C R E M E N T ,  
         c u s t o m e r I d   V A R C H A R ( 5 0 ) ,  
         i t e m I d   V A R C H A R ( 5 0 ) ,  
         p r i c e   D E C I M A L ( 1 0 ,   2 ) ,  
         F O R E I G N   K E Y   ( c u s t o m e r I d )   R E F E R E N C E S   c u s t o m e r s   ( i d ) ,  
         F O R E I G N   K E Y   ( i t e m I d )   R E F E R E N C E S   i t e m s   ( i d )  
 ) ;  
  
 - -   C r e d i t   C a r d   S e t t l e m e n t s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   s e t t l e m e n t s   (  
         i d   I N T   P R I M A R Y   K E Y   A U T O _ I N C R E M E N T ,  
         s e t t l e m e n t _ d a t e   D A T E ,  
         t o t a l A m o u n t   D E C I M A L ( 1 0 ,   2 ) ,  
         s t a t u s   E N U M ( ' P e n d i n g ' ,   ' S e t t l e d ' )   D E F A U L T   ' P e n d i n g ' ,  
         n o t e s   T E X T  
 ) ;  
  
 - -   K i t s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   k i t s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         n a m e   V A R C H A R ( 2 5 5 ) ,  
         d e s c r i p t i o n   T E X T ,  
         p r i c e   D E C I M A L ( 1 0 ,   2 )  
 ) ;  
  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   k i t _ i t e m s   (  
         k i t I d   V A R C H A R ( 5 0 ) ,  
         i t e m I d   V A R C H A R ( 5 0 ) ,  
         q u a n t i t y   I N T ,  
         F O R E I G N   K E Y   ( k i t I d )   R E F E R E N C E S   k i t s   ( i d ) ,  
         F O R E I G N   K E Y   ( i t e m I d )   R E F E R E N C E S   i t e m s   ( i d )  
 ) ;  
  
 - -   B a c k   O r d e r s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   b a c k _ o r d e r s   (  
         i d   V A R C H A R ( 5 0 )   P R I M A R Y   K E Y ,  
         i t e m I d   V A R C H A R ( 5 0 ) ,  
         q u a n t i t y   I N T ,  
         c u s t o m e r N a m e   V A R C H A R ( 1 0 0 ) ,  
         c o n t a c t P a r a m s   V A R C H A R ( 2 5 5 ) ,  
         d a t e O r d e r e d   D A T E ,  
         s t a t u s   E N U M ( ' P e n d i n g ' ,   ' F u l f i l l e d ' ) ,  
         F O R E I G N   K E Y   ( i t e m I d )   R E F E R E N C E S   i t e m s   ( i d )  
 ) ;  
 