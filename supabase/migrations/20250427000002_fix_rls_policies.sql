-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow admin access on ez_orders" ON ez_orders;
DROP POLICY IF EXISTS "Allow admin access on ez_order_items" ON ez_order_items;
DROP POLICY IF EXISTS "Allow admin access on ez_submissions" ON ez_submissions;

-- Create new RLS policies using auth.uid() instead of auth.role()
CREATE POLICY "Allow authenticated access on ez_orders"
ON ez_orders
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access on ez_order_items"
ON ez_order_items
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access on ez_submissions"
ON ez_submissions
FOR ALL
USING (auth.uid() IS NOT NULL);
