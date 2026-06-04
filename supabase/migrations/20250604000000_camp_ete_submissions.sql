-- Add camp_ete form_type to ez_submissions and add form_data JSONB column

ALTER TABLE ez_submissions
  DROP CONSTRAINT IF EXISTS ez_submissions_form_type_check;

ALTER TABLE ez_submissions
  ADD CONSTRAINT ez_submissions_form_type_check
  CHECK (form_type IN ('contact', 'appointment', 'camp_ete'));

ALTER TABLE ez_submissions
  ADD COLUMN IF NOT EXISTS form_data JSONB;
