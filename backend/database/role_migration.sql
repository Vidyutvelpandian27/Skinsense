-- Run once on an existing SkinSense database.
ALTER TABLE users
    ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user';

ALTER TABLE users
    ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL,
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE skin_parameters
    ADD COLUMN pimple_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    ADD COLUMN pimple_count INT NOT NULL DEFAULT 0;

-- Replace the email below with the account that should manage products.
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';