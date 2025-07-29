-- Create treatment_photos table
CREATE TABLE IF NOT EXISTS treatment_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treatment_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Create index for better performance
CREATE INDEX idx_treatment_photos_treatment_id ON treatment_photos(treatment_id);
