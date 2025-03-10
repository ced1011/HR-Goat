
-- Insert mock data for HR Portal

-- Insert Employees
INSERT INTO employees (id, name, position, department, email, phone, location, avatar, hire_date, status, manager, salary, bio)
VALUES
(1, 'John Doe', 'Senior Software Engineer', 'Engineering', 'john.doe@company.com', '(555) 123-4567', 'San Francisco, CA', 'https://randomuser.me/api/portraits/men/32.jpg', '2019-03-15', 'active', 'Jane Smith', 120000.00, 'John is a senior developer with expertise in React and Node.js. He has been with the company for over 3 years and leads the frontend team.'),
(2, 'Jane Smith', 'Product Manager', 'Product', 'jane.smith@company.com', '(555) 987-6543', 'New York, NY', 'https://randomuser.me/api/portraits/women/44.jpg', '2018-07-10', 'active', 'Robert Johnson', 135000.00, 'Jane oversees product development and works closely with engineering and design teams to deliver high-quality products.'),
(3, 'Michael Chen', 'UX Designer', 'Design', 'michael.chen@company.com', '(555) 456-7890', 'Austin, TX', 'https://randomuser.me/api/portraits/men/67.jpg', '2020-01-20', 'active', 'Sarah Williams', 95000.00, 'Michael is passionate about creating intuitive user experiences and has a background in both graphic design and user research.'),
(4, 'Sarah Williams', 'Design Director', 'Design', 'sarah.williams@company.com', '(555) 789-0123', 'San Francisco, CA', 'https://randomuser.me/api/portraits/women/63.jpg', '2017-11-05', 'active', 'Robert Johnson', 145000.00, 'Sarah leads the design team and has over 10 years of experience in product and brand design across multiple industries.'),
(5, 'David Kim', 'Marketing Specialist', 'Marketing', 'david.kim@company.com', '(555) 234-5678', 'Remote', 'https://randomuser.me/api/portraits/men/73.jpg', '2021-04-12', 'onleave', 'Lisa Chen', 85000.00, 'David specializes in digital marketing and social media strategies. He previously worked at a top marketing agency in Chicago.'),
(6, 'Emily Johnson', 'HR Specialist', 'HR', 'emily.johnson@company.com', '(555) 345-6789', 'New York, NY', 'https://randomuser.me/api/portraits/women/33.jpg', '2019-09-22', 'active', 'Robert Johnson', 90000.00, 'Emily handles employee relations, benefits administration, and recruitment. She has a master''s degree in HR management.'),
(7, 'James Wilson', 'Backend Developer', 'Engineering', 'james.wilson@company.com', '(555) 456-7890', 'Remote', 'https://randomuser.me/api/portraits/men/91.jpg', '2020-06-15', 'active', 'John Doe', 110000.00, 'James specializes in building scalable backend systems using Python and Go. He previously worked at a fintech startup.'),
(8, 'Lisa Chen', 'Marketing Director', 'Marketing', 'lisa.chen@company.com', '(555) 567-8901', 'San Francisco, CA', 'https://randomuser.me/api/portraits/women/76.jpg', '2018-03-01', 'active', 'Robert Johnson', 140000.00, 'Lisa oversees all marketing initiatives and has a proven track record of driving growth through innovative marketing strategies.');

-- Insert Users for authentication (passwords are hashed - all passwords are 'password123')
INSERT INTO users (id, username, email, password_hash, role, employee_id)
VALUES
(1, 'johndoe', 'john.doe@company.com', '$2a$12$RG5FSP6JklfthY9qgdqFOu88J/qsU8/5oz7t.AjhKTeoOsTlqRBsi', 'admin', 1),
(2, 'janesmith', 'jane.smith@company.com', '$2a$12$RG5FSP6JklfthY9qgdqFOu88J/qsU8/5oz7t.AjhKTeoOsTlqRBsi', 'manager', 2),
(3, 'michaelchen', 'michael.chen@company.com', '$2a$12$RG5FSP6JklfthY9qgdqFOu88J/qsU8/5oz7t.AjhKTeoOsTlqRBsi', 'employee', 3),
(4, 'admin', 'admin@company.com', '$2a$12$RG5FSP6JklfthY9qgdqFOu88J/qsU8/5oz7t.AjhKTeoOsTlqRBsi', 'admin', NULL);

-- Insert Payslips
INSERT INTO payslips (id, employee_id, period_start, period_end, gross_amount, net_amount, taxes, other_deductions, payment_date, status)
VALUES
(1, 1, '2023-05-01', '2023-05-15', 3500.00, 2650.00, 700.00, 150.00, '2023-05-16', 'paid'),
(2, 1, '2023-05-16', '2023-05-31', 3500.00, 2650.00, 700.00, 150.00, '2023-06-01', 'paid'),
(3, 1, '2023-06-01', '2023-06-15', 3500.00, 2650.00, 700.00, 150.00, '2023-06-16', 'paid'),
(4, 1, '2023-06-16', '2023-06-30', 3500.00, 2650.00, 700.00, 150.00, '2023-07-01', 'paid');

-- Insert Benefit Plans
INSERT INTO benefit_plans (id, name, type, description, coverage, monthly_cost, employer_contribution)
VALUES
(1, 'Premium Health Plan', 'health', 'Comprehensive health insurance with dental and vision coverage', 'Full family coverage with $500 deductible', 750.00, 600.00),
(2, '401(k) Retirement Plan', 'retirement', 'Retirement savings with employer matching up to 5%', 'Investment options through Fidelity', 0.00, 0.00),
(3, 'Life & Disability Insurance', 'insurance', 'Life insurance (2x annual salary) and short/long-term disability', 'Employee only, optional family riders available', 85.00, 85.00);

-- Insert Employee Benefits
INSERT INTO employee_benefits (id, employee_id, benefit_plan_id, enrollment_date, status)
VALUES
(1, 1, 1, '2020-01-01', 'active'),
(2, 1, 2, '2020-01-01', 'active');

-- Insert Tax Documents
INSERT INTO tax_documents (id, employee_id, year, document_type, file_url, upload_date, description)
VALUES
(1, 1, 2022, 'W2', '/documents/W2-2022.pdf', '2023-01-15', 'W-2 Wage and Tax Statement for 2022'),
(2, 1, 2021, 'W2', '/documents/W2-2021.pdf', '2022-01-17', 'W-2 Wage and Tax Statement for 2021');

-- Insert Performance Reviews
INSERT INTO performance_reviews (id, employee_id, reviewer_id, period_start, period_end, submission_date, status, overall_rating, strengths, areas_of_improvement, comments)
VALUES
(1, 1, 4, '2023-01-01', '2023-06-30', '2023-07-15', 'completed', 4.2, 'Strong technical skills, excellent team player, proactive problem solver.', 'Could improve documentation practices and sometimes struggles with deadlines on larger projects.', 'John has been a valuable asset to the engineering team this past half-year. His contributions to the new product launch were significant.'),
(2, 1, 4, '2022-07-01', '2022-12-31', '2023-01-10', 'completed', 4.0, 'Technical expertise, collaboration with design team, solution-oriented approach.', 'Time management and prioritization could be improved.', 'John continues to grow as an engineer and has shown improvement in cross-functional collaboration.');

-- Insert Performance Goals
INSERT INTO performance_goals (id, employee_id, title, description, category, target_date, creation_date, status, progress, metric_type, target_value, current_value)
VALUES
(1, 1, 'Complete Advanced React Certification', 'Finish the advanced React course and obtain certification to improve frontend development skills.', 'professional', '2023-09-30', '2023-01-15', 'inprogress', 75, 'completion', 100.00, 75.00),
(2, 1, 'Improve Code Review Efficiency', 'Reduce average time to complete code reviews while maintaining quality feedback.', 'team', '2023-12-31', '2023-01-15', 'inprogress', 60, 'time', 24.00, 36.00),
(3, 1, 'Mentor Junior Developer', 'Provide regular mentoring sessions to help onboard and train the new junior developer.', 'personal', '2023-12-31', '2023-02-01', 'inprogress', 50, 'sessions', 20.00, 10.00);

-- Insert Skill Assessments
INSERT INTO skill_assessments (id, employee_id, skill_name, category, rating, assessment_date, assessor_id, comments)
VALUES
(1, 1, 'React.js', 'technical', 4.5, '2023-07-01', 4, 'Strong expertise in React, consistently delivers high-quality components and solutions.'),
(2, 1, 'Node.js', 'technical', 4.0, '2023-07-01', 4, 'Good understanding of Node.js backend development, continues to improve.'),
(3, 1, 'Team Communication', 'soft', 3.8, '2023-07-01', 4, 'Communicates well with the team, can sometimes be more proactive in updates.'),
(4, 1, 'Problem Solving', 'soft', 4.2, '2023-07-01', 4, 'Excellent problem-solver, approaches challenges with creativity and persistence.');
