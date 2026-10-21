CREATE DATABASE IF NOT EXISTS skinsense2;
USE skinsense2;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_no VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500),
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    overall_score DECIMAL(5,2),
    overall_status VARCHAR(50),
    skin_type VARCHAR(50),
    image_quality_score DECIMAL(5,2),
    analysis_status VARCHAR(30) DEFAULT 'Processing',
    error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE skin_conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    condition_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    detection_method VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE severity_levels (
    severity_id INT AUTO_INCREMENT PRIMARY KEY,
    severity_name VARCHAR(50) NOT NULL UNIQUE,
    score_min DECIMAL(5,2) NOT NULL,
    score_max DECIMAL(5,2) NOT NULL,
    description TEXT
);

CREATE TABLE analysis_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    condition_id INT NOT NULL,
    severity_id INT NOT NULL,
    score DECIMAL(5,2),
    detected_area_percentage DECIMAL(6,2),
    confidence DECIMAL(5,2),
    detected_regions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (condition_id) REFERENCES skin_conditions(condition_id) ON DELETE CASCADE,
    FOREIGN KEY (severity_id) REFERENCES severity_levels(severity_id) ON DELETE RESTRICT,
    UNIQUE (report_id, condition_id)
);

CREATE TABLE brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    brand_logo VARCHAR(500),
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    category_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    ingredients TEXT,
    usage_instructions TEXT,
    skin_type VARCHAR(255),
    price DECIMAL(10,2),
    product_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE RESTRICT
);

CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_type VARCHAR(50) DEFAULT 'product',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE condition_product_recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    condition_id INT NOT NULL,
    severity_id INT NOT NULL,
    product_id INT NOT NULL,
    priority INT DEFAULT 1,
    recommendation_reason TEXT,
    usage_frequency VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condition_id) REFERENCES skin_conditions(condition_id) ON DELETE CASCADE,
    FOREIGN KEY (severity_id) REFERENCES severity_levels(severity_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE (condition_id, severity_id, product_id)
);

CREATE TABLE report_recommendations (
    report_recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    result_id INT NOT NULL,
    product_id INT NOT NULL,
    priority INT DEFAULT 1,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (result_id) REFERENCES analysis_results(result_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE routines (
    routine_id INT AUTO_INCREMENT PRIMARY KEY,
    routine_name VARCHAR(150) NOT NULL,
    routine_type ENUM('MORNING', 'NIGHT') NOT NULL,
    description TEXT
);

CREATE TABLE routine_products (
    routine_product_id INT AUTO_INCREMENT PRIMARY KEY,
    routine_id INT NOT NULL,
    product_id INT NOT NULL,
    step_number INT NOT NULL,
    instruction TEXT,
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE lifestyle_tips (
    tip_id INT AUTO_INCREMENT PRIMARY KEY,
    tip_title VARCHAR(200) NOT NULL,
    tip_description TEXT,
    condition_id INT,
    severity_id INT,
    FOREIGN KEY (condition_id) REFERENCES skin_conditions(condition_id) ON DELETE SET NULL,
    FOREIGN KEY (severity_id) REFERENCES severity_levels(severity_id) ON DELETE SET NULL
);

CREATE TABLE report_lifestyle_tips (
    report_tip_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    tip_id INT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
    FOREIGN KEY (tip_id) REFERENCES lifestyle_tips(tip_id) ON DELETE CASCADE
);

INSERT INTO severity_levels (severity_name, score_min, score_max, description) VALUES
('Low', 60, 100, 'Low visible concern'),
('Medium', 40, 59.99, 'Moderate visible concern'),
('High', 0, 39.99, 'High visible concern');

INSERT INTO skin_conditions (condition_name, description, detection_method) VALUES
('Redness', 'Visible redness indicators.', 'LAB, HSV and Excess Red voting'),
('Pimples', 'Visible pimple indicators.', 'HSV, LAB, adaptive threshold and connected components'),
('Dark Spots', 'Visible darker regions.', 'LAB, HSV, YCrCb and black-hat'),
('Wrinkles', 'Visible line patterns.', 'Black-hat, Gabor, Canny, Laplacian and LBP'),
('Texture', 'Visible texture variation.', 'LBP, Gabor, GLCM, Laplacian and Wavelet'),
('Oiliness', 'Visible shine indicators.', 'HSV and LAB brightness'),
('Dryness', 'Visible dryness indicators.', 'Brightness and texture variation'),
('Skin Tone', 'Visible skin tone.', 'LAB median analysis'),
('Tone Uniformity', 'Visible regional tone variation.', 'Regional color comparison');
