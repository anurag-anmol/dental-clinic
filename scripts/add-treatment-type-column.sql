-- Add treatment_type column to treatments table
ALTER TABLE treatments ADD COLUMN treatment_type VARCHAR(100) AFTER treatment_name;

-- Add treatment_photos table for storing treatment photos
CREATE TABLE IF NOT EXISTS treatment_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    treatment_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_treatment_photos_treatment ON treatment_photos(treatment_id);
