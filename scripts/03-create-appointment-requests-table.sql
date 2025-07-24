USE dental1;

-- Table for public appointment requests
CREATE TABLE IF NOT EXISTS appointment_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    preferred_date DATE,
    preferred_time TIME,
    message TEXT,
    status ENUM('new', 'contacted', 'scheduled', 'cancelled') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookup
CREATE INDEX idx_appointment_requests_status ON appointment_requests(status);
