
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SqlScriptsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>SQL Scripts</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          View the SQL scripts used to set up the database and insert mock data.
        </p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Setup Database Script</h3>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{`-- This is a simplified representation of the setup script
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100),
  department VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  location VARCHAR(100),
  avatar VARCHAR(255),
  hireDate DATE,
  status ENUM('active', 'inactive', 'onleave') DEFAULT 'active',
  manager VARCHAR(100),
  salary DECIMAL(10, 2),
  bio TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  managerId INT,
  FOREIGN KEY (managerId) REFERENCES employees(id)
);

-- More tables for performance, payroll, etc. would be defined here
`}</pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Mock Data Script</h3>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{`-- This is a simplified representation of the mock data script
INSERT INTO employees (name, position, department, email, phone, location, avatar, hireDate, status, manager, salary, bio)
VALUES
  ('John Doe', 'Senior Software Engineer', 'Engineering', 'john.doe@company.com', '(555) 123-4567', 'San Francisco, CA', 'https://randomuser.me/api/portraits/men/32.jpg', '2019-03-15', 'active', 'Jane Smith', 120000, 'John is a senior developer with expertise in React and Node.js.'),
  ('Jane Smith', 'Product Manager', 'Product', 'jane.smith@company.com', '(555) 987-6543', 'New York, NY', 'https://randomuser.me/api/portraits/women/44.jpg', '2018-07-10', 'active', 'Robert Johnson', 135000, 'Jane oversees product development and works closely with engineering and design teams.'),
  -- More employee records would be inserted here

INSERT INTO departments (name, description, managerId)
VALUES
  ('Engineering', 'Software development and infrastructure', 1),
  ('Product', 'Product management and design', 2),
  -- More department records would be inserted here
`}</pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SqlScriptsTab;
