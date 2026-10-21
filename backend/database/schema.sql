-- =====================================================
-- SkinSense Database
-- =====================================================

CREATE DATABASE IF NOT EXISTS skinsense1;

USE skinsense1;


-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    profile_image VARCHAR(500) DEFAULT NULL,

    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =====================================================
-- 2. SKIN ANALYSIS
-- =====================================================

CREATE TABLE IF NOT EXISTS skin_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    image_path VARCHAR(500) DEFAULT NULL,

    overall_score DECIMAL(5,2) DEFAULT 0,

    skin_type VARCHAR(50) DEFAULT NULL,

    image_quality_score DECIMAL(5,2) DEFAULT NULL,

    analysis_status ENUM(
        'Pending',
        'Processing',
        'Completed',
        'Failed'
    ) DEFAULT 'Pending',

    error_message TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_analysis_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 3. SKIN PARAMETERS
-- =====================================================

CREATE TABLE IF NOT EXISTS skin_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,

    analysis_id INT NOT NULL,

    redness_score DECIMAL(5,2) DEFAULT 0,

    dark_spots_score DECIMAL(5,2) DEFAULT 0,

    wrinkles_score DECIMAL(5,2) DEFAULT 0,

    texture_score DECIMAL(5,2) DEFAULT 0,

    oiliness_score DECIMAL(5,2) DEFAULT 0,

    dryness_score DECIMAL(5,2) DEFAULT 0,

    skin_tone_score DECIMAL(5,2) DEFAULT 0,

    pimple_score DECIMAL(5,2) DEFAULT 0,

    pimple_count INT DEFAULT 0,

    average_brightness DECIMAL(8,2) DEFAULT NULL,

    average_redness DECIMAL(8,2) DEFAULT NULL,

    average_color_r DECIMAL(8,2) DEFAULT NULL,

    average_color_g DECIMAL(8,2) DEFAULT NULL,

    average_color_b DECIMAL(8,2) DEFAULT NULL,

    texture_variance DECIMAL(10,4) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parameters_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES skin_analysis(id)
        ON DELETE CASCADE
);


-- =====================================================
-- 4. CONCERNS
-- =====================================================

CREATE TABLE IF NOT EXISTS concerns (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO concerns (name, description) VALUES
    ('Redness', 'Visible redness indicators detected during analysis.'),
    ('Pimples', 'Visible pimple indicators detected during analysis.');


-- =====================================================
-- 5. ANALYSIS CONCERNS
-- =====================================================

CREATE TABLE IF NOT EXISTS analysis_concerns (
    id INT AUTO_INCREMENT PRIMARY KEY,

    analysis_id INT NOT NULL,

    concern_id INT NOT NULL,

    severity ENUM(
        'Low',
        'Medium',
        'High'
    ) DEFAULT 'Medium',

    score DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_analysis_concern_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES skin_analysis(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_analysis_concern_concern
        FOREIGN KEY (concern_id)
        REFERENCES concerns(id)
        ON DELETE CASCADE,

    UNIQUE (
        analysis_id,
        concern_id
    )
);


-- =====================================================
-- 6. PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(200) NOT NULL,

    brand VARCHAR(150) DEFAULT NULL,

    description TEXT DEFAULT NULL,

    category VARCHAR(100) DEFAULT NULL,

    price DECIMAL(10,2) DEFAULT NULL,

    image_url VARCHAR(500) DEFAULT NULL,

    product_url VARCHAR(500) DEFAULT NULL,

    skin_type VARCHAR(100) DEFAULT NULL,

    ingredients TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =====================================================
-- 7. PRODUCT CONCERNS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_concerns (
    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    concern_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_concern_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_concern_concern
        FOREIGN KEY (concern_id)
        REFERENCES concerns(id)
        ON DELETE CASCADE,

    UNIQUE (
        product_id,
        concern_id
    )
);


-- =====================================================
-- 8. RECOMMENDATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    analysis_id INT NOT NULL,

    concern_id INT DEFAULT NULL,

    product_id INT DEFAULT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT DEFAULT NULL,

    priority ENUM(
        'Low',
        'Medium',
        'High'
    ) DEFAULT 'Medium',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendation_analysis
        FOREIGN KEY (analysis_id)
        REFERENCES skin_analysis(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendation_concern
        FOREIGN KEY (concern_id)
        REFERENCES concerns(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_recommendation_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
);


-- =====================================================
-- INITIAL CONCERNS
-- =====================================================

INSERT IGNORE INTO concerns
    (name, description)
VALUES
(
    'Redness',
    'Visible redness or increased red appearance of the skin.'
),
(
    'Dark Spots',
    'Visible dark pigmentation or spots on the skin.'
),
(
    'Wrinkles',
    'Visible fine lines and wrinkles.'
),
(
    'Uneven Texture',
    'Irregular or rough skin surface texture.'
),
(
    'Oiliness',
    'Excessive visible oil or shine on the skin.'
),
(
    'Dryness',
    'Visible signs of dry or dehydrated skin.'
),
(
    'Uneven Skin Tone',
    'Variation in skin tone across the analyzed region.'
);


-- =====================================================
-- SAMPLE PRODUCTS
-- =====================================================

INSERT IGNORE INTO products
    (
        name,
        brand,
        description,
        category,
        price,
        image_url,
        product_url,
        skin_type
    )
VALUES
(
    'Hydrating Moisturizer',
    'SkinSense',
    'A basic moisturizer recommendation for dry-looking skin.',
    'Moisturizer',
    499.00,
    NULL,
    NULL,
    'Dry,Normal,Combination'
),
(
    'Gentle Facial Cleanser',
    'SkinSense',
    'A gentle cleanser suitable for daily skincare.',
    'Cleanser',
    399.00,
    NULL,
    NULL,
    'Normal,Dry,Oily,Combination,Sensitive'
),
(
    'Daily Sunscreen SPF 50',
    'SkinSense',
    'Daily sunscreen for protection against UV exposure.',
    'Sunscreen',
    599.00,
    NULL,
    NULL,
    'Normal,Dry,Oily,Combination,Sensitive'
);


-- =====================================================
-- MAP SAMPLE PRODUCTS TO CONCERNS
-- =====================================================

INSERT IGNORE INTO product_concerns
    (product_id, concern_id)
SELECT
    p.id,
    c.id
FROM products p
JOIN concerns c
    ON c.name = 'Dryness'
WHERE p.name = 'Hydrating Moisturizer';


INSERT IGNORE INTO product_concerns
    (product_id, concern_id)
SELECT
    p.id,
    c.id
FROM products p
JOIN concerns c
    ON c.name = 'Uneven Skin Tone'
WHERE p.name = 'Daily Sunscreen SPF 50';


-- =====================================================
-- END OF SCHEMA
-- =====================================================