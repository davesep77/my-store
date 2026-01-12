-- Update users table for SaaS authentication
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending_verification';
-- active, pending_verification, suspended
ALTER TABLE users
ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT NULL;

ALTER TABLE users MODIFY COLUMN password VARCHAR(255);

-- Ensure there is at least one admin account (password is 'admin123' hashed)
-- We insert only if not exists (using username as unique key if applicable, or just ID)
-- Assuming username is unique
INSERT IGNORE INTO
    users (
        username,
        password,
        role,
        status
    )
VALUES (
        'admin',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin',
        'active'
    );