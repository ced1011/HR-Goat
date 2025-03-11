-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hrportal;

-- Use the database
USE hrportal;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    hire_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active',
    manager_id INT,
    salary DECIMAL(10, 2),
    bio TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create admin user
INSERT INTO users (username, password, email, first_name, last_name, role)
VALUES ('admin', '$2b$10$rPQcLj1FkzMDNGrLEclCn.4aFRwPCsI3zyBtMQZ5tRVJ.J.nkQWfO', 'admin@example.com', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE username = 'admin';
-- Note: Password is 'admin123' hashed with bcrypt

-- Create sample departments
INSERT INTO departments (name, description)
VALUES 
    ('Engineering', 'Software development and engineering'),
    ('HR', 'Human Resources'),
    ('Finance', 'Financial operations and accounting'),
    ('Marketing', 'Marketing and sales')
ON DUPLICATE KEY UPDATE name = VALUES(name); 