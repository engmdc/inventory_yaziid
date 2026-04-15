-- Create the Database
CREATE DATABASE IF NOT EXISTS store_system_db;
USE store_system_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cashier',
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin and Cashier
INSERT IGNORE INTO users (id, username, password, role, name) 
VALUES 
('admin', 'admin', 'admin', 'admin', 'Administrator'),
('cashier', 'cashier', 'cashier', 'cashier', 'Cashier User');

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    debt DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    totalPurchases INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id VARCHAR(100)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id VARCHAR(100)
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(100) PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL,    -- 'sale' or 'payment'
    amount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50),   -- 'cash' or 'credit'
    customer_id VARCHAR(100),
    customer_name VARCHAR(150),
    custom_id VARCHAR(100),
    owner_id VARCHAR(100)
);

-- 5. Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- 6. Store Profiles Table
CREATE TABLE IF NOT EXISTS store_profiles (
    user_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) DEFAULT 'MyStore',
    address VARCHAR(200) DEFAULT 'Mogadishu, Somalia',
    phone VARCHAR(50) DEFAULT '+252 61 5000000',
    receiptSize VARCHAR(20) DEFAULT '80mm',
    taxNumber VARCHAR(100),
    receiptFooter TEXT,
    showCashier VARCHAR(10) DEFAULT 'yes'
);
