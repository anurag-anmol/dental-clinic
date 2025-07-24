USE dental1;

-- Insert admin and staff users (password is 'password123' hashed with bcrypt)
-- Note: In production, these should be properly hashed. For demo, using a simple hash format
INSERT INTO users (email, password_hash, first_name, last_name, role, phone) VALUES
('admin@dentalclinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', '+1234567890'),
('dr.smith@dentalclinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Smith', 'dentist', '+1234567891'),
('dr.johnson@dentalclinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Johnson', 'dentist', '+1234567892'),
('hygienist@dentalclinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mary', 'Wilson', 'hygienist', '+1234567893'),
('reception@dentalclinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lisa', 'Brown', 'receptionist', '+1234567894'),
('accountant@dentalclinic.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Davis', 'accountant', '+1234567895');

-- Insert sample patients
INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, gender, address, insurance_provider, medical_history, allergies) VALUES
('P001', 'Alice', 'Cooper', 'alice@email.com', '+1234567896', '1985-03-15', 'female', '123 Main St, City', 'Blue Cross', 'No significant medical history', 'Penicillin'),
('P002', 'Bob', 'Davis', 'bob@email.com', '+1234567897', '1990-07-22', 'male', '456 Oak Ave, City', 'Aetna', 'Hypertension', 'None'),
('P003', 'Carol', 'Evans', 'carol@email.com', '+1234567898', '1978-11-08', 'female', '789 Pine Rd, City', 'Cigna', 'Diabetes Type 2', 'Latex'),
('P004', 'David', 'Miller', 'david@email.com', '+1234567899', '1995-01-30', 'male', '321 Elm St, City', 'United Health', 'No significant medical history', 'None'),
('P005', 'Emma', 'Taylor', 'emma@email.com', '+1234567900', '1988-09-12', 'female', '654 Maple Dr, City', 'Blue Cross', 'Asthma', 'Aspirin');

-- Insert sample appointments
INSERT INTO appointments (patient_id, dentist_id, appointment_date, appointment_time, treatment_type, status, notes) VALUES
(1, 2, CURDATE(), '09:00:00', 'Routine Cleaning', 'scheduled', 'Regular checkup and cleaning'),
(2, 2, CURDATE(), '10:30:00', 'Filling', 'confirmed', 'Composite filling on tooth #14'),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', 'Root Canal', 'scheduled', 'Root canal treatment on tooth #6'),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', 'Crown Placement', 'scheduled', 'Crown placement after root canal'),
(5, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '15:30:00', 'Teeth Whitening', 'confirmed', 'Professional teeth whitening session');

-- Insert sample inventory items
INSERT INTO inventory (item_name, category, current_stock, minimum_stock, unit_price, supplier, expiry_date) VALUES
('Dental Gloves (Box)', 'PPE', 50, 10, 25.99, 'Medical Supplies Co', '2024-12-31'),
('Dental Masks (Box)', 'PPE', 8, 15, 19.99, 'Medical Supplies Co', '2024-11-30'),
('Composite Filling Material', 'Restorative', 8, 5, 89.99, 'Dental Materials Inc', '2025-06-15'),
('Local Anesthetic', 'Anesthesia', 3, 10, 12.50, 'Pharma Dental', '2024-08-20'),
('Dental Burs (Set)', 'Instruments', 15, 8, 45.00, 'Instrument Supply', NULL),
('X-ray Films', 'Imaging', 100, 20, 2.50, 'Imaging Solutions', '2024-09-30'),
('Dental Cement', 'Restorative', 12, 6, 35.75, 'Dental Materials Inc', '2025-03-10');

-- Insert sample treatment plans
INSERT INTO treatment_plans (patient_id, dentist_id, diagnosis, treatment_description, estimated_cost, status) VALUES
(1, 2, 'Gingivitis', 'Deep cleaning and oral hygiene education', 150.00, 'accepted'),
(2, 2, 'Dental Caries', 'Composite filling on tooth #14', 200.00, 'in_progress'),
(3, 3, 'Pulpitis', 'Root canal treatment on tooth #6', 800.00, 'proposed');

-- Insert sample treatments
INSERT INTO treatments (patient_id, dentist_id, treatment_plan_id, treatment_name, treatment_date, tooth_number, procedure_notes, cost, status) VALUES
(1, 2, 1, 'Deep Cleaning', CURDATE(), NULL, 'Thorough cleaning and scaling performed', 150.00, 'completed'),
(2, 2, 2, 'Composite Filling', CURDATE(), '14', 'Composite filling placed on tooth #14', 200.00, 'in_progress');

-- Insert sample invoices
INSERT INTO invoices (invoice_number, patient_id, total_amount, paid_amount, balance_amount, status, due_date) VALUES
('INV-2024-001', 1, 150.00, 150.00, 0.00, 'paid', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('INV-2024-002', 2, 200.00, 100.00, 100.00, 'partial', DATE_ADD(CURDATE(), INTERVAL 15 DAY)),
('INV-2024-003', 3, 800.00, 0.00, 800.00, 'pending', DATE_ADD(CURDATE(), INTERVAL 28 DAY));

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, treatment_id, description, quantity, unit_price, total_price) VALUES
(1, 1, 'Deep Cleaning', 1, 150.00, 150.00),
(2, 2, 'Composite Filling', 1, 200.00, 200.00),
(3, NULL, 'Root Canal Treatment', 1, 800.00, 800.00);

-- Insert sample payments
INSERT INTO payments (invoice_id, amount, payment_method, payment_date, transaction_id) VALUES
(1, 150.00, 'card', CURDATE(), 'TXN123456'),
(2, 100.00, 'cash', CURDATE(), 'CASH001');

-- Insert staff schedules for today
INSERT INTO staff_schedules (user_id, work_date, start_time, end_time, status) VALUES
(2, CURDATE(), '09:00:00', '17:00:00', 'present'),
(3, CURDATE(), '10:00:00', '18:00:00', 'present'),
(4, CURDATE(), '08:00:00', '16:00:00', 'present'),
(5, CURDATE(), '08:00:00', '17:00:00', 'present'),
(6, CURDATE(), '09:00:00', '17:00:00', 'present');
