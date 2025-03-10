
-- Database Schema Setup for HR Portal

-- Create Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  location VARCHAR(100),
  avatar VARCHAR(255),
  hire_date DATE NOT NULL,
  status ENUM('active', 'onleave', 'terminated') NOT NULL DEFAULT 'active',
  manager VARCHAR(100),
  salary DECIMAL(10, 2),
  bio TEXT
);

-- Create Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  employee_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create Payslips table
CREATE TABLE IF NOT EXISTS payslips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_amount DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  taxes DECIMAL(10, 2) NOT NULL,
  other_deductions DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status ENUM('pending', 'processed', 'paid') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Create Benefit Plans table
CREATE TABLE IF NOT EXISTS benefit_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('health', 'retirement', 'insurance', 'other') NOT NULL,
  description TEXT,
  coverage TEXT,
  monthly_cost DECIMAL(10, 2) NOT NULL,
  employer_contribution DECIMAL(10, 2) NOT NULL
);

-- Create Employee Benefits table
CREATE TABLE IF NOT EXISTS employee_benefits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  benefit_plan_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'pending', 'terminated') NOT NULL DEFAULT 'active',
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (benefit_plan_id) REFERENCES benefit_plans(id)
);

-- Create Tax Documents table
CREATE TABLE IF NOT EXISTS tax_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  year INT NOT NULL,
  document_type ENUM('W2', 'W4', '1099', 'other') NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  upload_date DATE NOT NULL,
  description TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Create Performance Reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  submission_date DATE NOT NULL,
  status ENUM('draft', 'submitted', 'inprogress', 'completed') NOT NULL,
  overall_rating DECIMAL(3, 1) NOT NULL,
  strengths TEXT,
  areas_of_improvement TEXT,
  comments TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);

-- Create Performance Goals table
CREATE TABLE IF NOT EXISTS performance_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category ENUM('personal', 'professional', 'team', 'company') NOT NULL,
  target_date DATE NOT NULL,
  creation_date DATE NOT NULL,
  status ENUM('notstarted', 'inprogress', 'completed') NOT NULL DEFAULT 'notstarted',
  progress INT NOT NULL DEFAULT 0,
  metric_type VARCHAR(50),
  target_value DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Create Skill Assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  category ENUM('technical', 'soft', 'leadership', 'domain') NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  assessment_date DATE NOT NULL,
  assessor_id INT,
  comments TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (assessor_id) REFERENCES employees(id)
);
