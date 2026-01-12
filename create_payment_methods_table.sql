CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT DEFAULT 1, -- Single user system for now
    type VARCHAR(20) NOT NULL, -- 'card', 'paypal'
    provider VARCHAR(20) NOT NULL, -- 'stripe', 'paypal'
    last4 VARCHAR(4),
    expiry_month INT,
    expiry_year INT,
    brand VARCHAR(20), -- 'visa', 'mastercard'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);