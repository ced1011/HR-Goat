
-- Insert sample employee data if it doesn't exist
INSERT IGNORE INTO employees (id, name, position, department, email, phone, location, avatar, hire_date, status, manager, salary, bio)
VALUES
  (1, 'John Doe', 'Senior Software Engineer', 'Engineering', 'john.doe@company.com', '(555) 123-4567', 'San Francisco, CA', 'https://randomuser.me/api/portraits/men/32.jpg', '2019-03-15', 'active', 'Jane Smith', 120000, 'John is a senior developer with expertise in React and Node.js.'),
  (2, 'Jane Smith', 'Product Manager', 'Product', 'jane.smith@company.com', '(555) 987-6543', 'New York, NY', 'https://randomuser.me/api/portraits/women/44.jpg', '2018-07-10', 'active', 'Robert Johnson', 135000, 'Jane oversees product development and works closely with engineering and design teams.'),
  (3, 'Michael Chen', 'UX Designer', 'Design', 'michael.chen@company.com', '(555) 456-7890', 'Austin, TX', 'https://randomuser.me/api/portraits/men/67.jpg', '2020-01-20', 'active', 'Sarah Williams', 95000, 'Michael is passionate about creating intuitive user experiences.');

-- Insert sample users for authentication if they don't exist
INSERT IGNORE INTO users (id, username, email, password_hash, role, employee_id)
VALUES
  (1, 'admin', 'admin@company.com', '$2a$10$MNxf7V6e0xXLmM3YF3HHVeTcLSPYfhuDqrXnZjDSiUNiN7g/EfW3G', 'admin', NULL), -- password: admin123
  (2, 'jdoe', 'john.doe@company.com', '$2a$10$dSvxY3frXJb9YobOcZpSW.3/JO.X/dPB30BGnNLzTCsUiyeN0lV7K', 'employee', 1); -- password: jdoe123

-- Insert sample benefit plans if they don't exist
INSERT IGNORE INTO benefit_plans (id, name, type, description, coverage, monthly_cost, employer_contribution)
VALUES
  (1, 'Premium Health Plan', 'health', 'Comprehensive health coverage including medical, dental, and vision', 'Full coverage for preventive care, $20 copay for office visits', 300.00, 250.00),
  (2, '401(k) Retirement Plan', 'retirement', 'Tax-advantaged retirement savings plan', '100% match up to 6% of salary', 0.00, 0.00),
  (3, 'Life Insurance', 'insurance', 'Basic life insurance coverage', '$50,000 coverage', 25.00, 25.00);

-- Insert employee benefits enrollment data if it doesn't exist
INSERT IGNORE INTO employee_benefits (id, employee_id, benefit_plan_id, enrollment_date, status)
VALUES
  (1, 1, 1, '2019-04-01', 'active'),
  (2, 1, 2, '2019-04-01', 'active'),
  (3, 2, 1, '2018-08-01', 'active'),
  (4, 2, 2, '2018-08-01', 'active'),
  (5, 3, 1, '2020-02-01', 'active');

-- Insert sample performance reviews if they don't exist
INSERT IGNORE INTO performance_reviews (id, employee_id, reviewer_id, period_start, period_end, submission_date, status, overall_rating, strengths, areas_of_improvement, comments)
VALUES
  (1, 1, 2, '2022-01-01', '2022-12-31', '2023-01-15', 'completed', 4.5, 'Technical expertise, teamwork, problem-solving', 'Documentation, knowledge sharing', 'John consistently delivers high-quality work and is a valuable team member.'),
  (2, 2, 3, '2022-01-01', '2022-12-31', '2023-01-20', 'completed', 4.7, 'Leadership, communication, strategic thinking', 'Delegation, work-life balance', 'Jane has excellent product vision and successfully led multiple high-impact projects.');

-- Insert sample performance goals if they don't exist
INSERT IGNORE INTO performance_goals (id, employee_id, title, description, category, target_date, creation_date, status, progress, metric_type, target_value, current_value)
VALUES
  (1, 1, 'Learn React Native', 'Develop proficiency in React Native to support mobile app development', 'professional', '2023-06-30', '2023-01-15', 'inprogress', 60, 'Completion percentage', 100, 60),
  (2, 1, 'Improve Code Documentation', 'Ensure all new code has proper documentation and comments', 'professional', '2023-12-31', '2023-01-15', 'inprogress', 45, 'Documentation coverage', 95, 45),
  (3, 2, 'Launch Product Feature X', 'Successfully launch and measure adoption of Feature X', 'team', '2023-09-30', '2023-01-20', 'inprogress', 75, 'Completion percentage', 100, 75);

-- Insert sample skill assessments if they don't exist
INSERT IGNORE INTO skill_assessments (id, employee_id, skill_name, category, rating, assessment_date, assessor_id, comments)
VALUES
  (1, 1, 'JavaScript', 'technical', 4.8, '2023-01-15', 2, 'Expert in JavaScript with deep understanding of async patterns and modern ES features'),
  (2, 1, 'React', 'technical', 4.6, '2023-01-15', 2, 'Strong React skills, particularly in state management and custom hooks'),
  (3, 1, 'Communication', 'soft', 3.8, '2023-01-15', 2, 'Good communication skills, could improve in explaining technical concepts to non-technical stakeholders'),
  (4, 2, 'Product Strategy', 'domain', 4.9, '2023-01-20', 3, 'Exceptional strategic thinking and market awareness');
