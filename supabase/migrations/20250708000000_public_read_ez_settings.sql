-- Allow public (anon) read access on ez_settings
-- Needed for the "Coming Soon" toggle to work for all visitors
CREATE POLICY "Allow public read on ez_settings"
  ON ez_settings
  FOR SELECT
  USING (true);
