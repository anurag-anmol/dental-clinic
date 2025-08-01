  -- Create treatment_medicines table for storing medicine prescriptions
  CREATE TABLE IF NOT EXISTS treatment_medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    treatment_id INT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE,
    INDEX idx_treatment_medicines_treatment_id (treatment_id)
  );



