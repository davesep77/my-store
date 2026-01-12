-- Update users table to support new signup fields
-- Run this SQL in your phpMyAdmin or MySQL client

-- Add subscription_plan column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'starter';

-- Add account_status column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'trial';

-- Update existing users without these fields
UPDATE users
SET subscription_plan = 'starter'
WHERE subscription_plan IS NULL OR subscription_plan = '';

UPDATE users
SET account_status = 'trial'
WHERE account_status IS NULL OR account_status = '';

-- Verify the changes
SELECT id, username, email, subscription_plan, account_status FROM users LIMIT 5;
