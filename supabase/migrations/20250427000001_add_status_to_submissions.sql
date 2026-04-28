-- Add status column to ez_submissions if it doesn't exist
ALTER TABLE ez_submissions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new' 
CHECK (status IN ('new', 'contacted', 'converted'));

-- Add index for status if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_ez_submissions_status ON ez_submissions(status);
