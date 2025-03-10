-- Database Schema Setup for HRGoat

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

-- Create Bank Accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  account_type ENUM('checking', 'savings', 'investment') NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  routing_number VARCHAR(20) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Insert mock data for bank accounts
INSERT INTO bank_accounts (employee_id, account_type, bank_name, account_number, routing_number, is_primary)
VALUES 
  (1, 'checking', 'Chase Bank', '****4567', '****1234', TRUE),
  (1, 'savings', 'Bank of America', '****7890', '****5678', FALSE),
  (2, 'checking', 'Wells Fargo', '****2345', '****9012', TRUE),
  (3, 'checking', 'Citibank', '****6789', '****3456', TRUE),
  (3, 'investment', 'Fidelity', '****1234', '****7890', FALSE),
  (4, 'checking', 'TD Bank', '****5678', '****2345', TRUE),
  (5, 'checking', 'PNC Bank', '****9012', '****6789', TRUE);

-- Create Calendar Events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  location VARCHAR(255),
  event_type ENUM('meeting', 'holiday', 'training', 'conference', 'other') NOT NULL DEFAULT 'other',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Insert mock data for calendar events
INSERT INTO calendar_events (title, description, start_date, end_date, location, event_type, created_by)
VALUES 
  ('Quarterly Review Meeting', 'Review of Q2 performance and goals', '2023-07-15 10:00:00', '2023-07-15 12:00:00', 'Conference Room A', 'meeting', 1),
  ('Company Picnic', 'Annual company picnic at Central Park', '2023-07-22 12:00:00', '2023-07-22 16:00:00', 'Central Park', 'other', 2),
  ('New Product Training', 'Training session for the new product launch', '2023-07-18 09:00:00', '2023-07-19 17:00:00', 'Training Center', 'training', 4),
  ('Independence Day', 'Office closed for Independence Day', '2023-07-04 00:00:00', '2023-07-04 23:59:59', 'N/A', 'holiday', 1),
  ('Tech Conference', 'Annual technology conference', '2023-08-10 09:00:00', '2023-08-12 18:00:00', 'Convention Center', 'conference', 3),
  ('Team Building Workshop', 'Workshop focused on improving team collaboration', '2023-07-28 13:00:00', '2023-07-28 17:00:00', 'Recreation Room', 'training', 2),
  ('Board Meeting', 'Quarterly board meeting', '2023-07-31 14:00:00', '2023-07-31 16:00:00', 'Executive Boardroom', 'meeting', 4),
  ('Labor Day', 'Office closed for Labor Day', '2023-09-04 00:00:00', '2023-09-04 23:59:59', 'N/A', 'holiday', 1),
  ('Annual Performance Reviews', 'Annual employee performance review period begins', '2023-10-01 09:00:00', '2023-10-15 17:00:00', 'Various Locations', 'other', 2),
  ('Holiday Party', 'Annual company holiday celebration', '2023-12-15 18:00:00', '2023-12-15 22:00:00', 'Grand Hotel Ballroom', 'other', 4);
