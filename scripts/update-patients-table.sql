-- Add updated_at column to patients table if it doesn't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have updated_at same as created_at
UPDATE patients SET updated_at = created_at WHERE updated_at IS NULL;
