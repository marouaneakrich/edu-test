-- ez_orders table
CREATE TABLE IF NOT EXISTS ez_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    org_id TEXT NOT NULL DEFAULT 'educazen',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city TEXT NOT NULL DEFAULT 'Agadir',
    items JSONB NOT NULL DEFAULT '[]',
    total_amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method = 'cod'),
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending','processing','delivered')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ez_order_items table
CREATE TABLE IF NOT EXISTS ez_order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id TEXT NOT NULL REFERENCES ez_orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ez_submissions table
CREATE TABLE IF NOT EXISTS ez_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    org_id TEXT NOT NULL DEFAULT 'educazen',
    form_type TEXT NOT NULL CHECK (form_type IN ('contact', 'appointment')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT,
    child_age INTEGER,
    child_profile TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ez_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ez_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ez_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous inserts (from website)
CREATE POLICY "Allow anon inserts on ez_orders"
ON ez_orders
FOR INSERT
WITH CHECK (org_id = 'educazen');

CREATE POLICY "Allow anon inserts on ez_order_items"
ON ez_order_items
FOR INSERT
WITH CHECK (order_id IS NOT NULL);

CREATE POLICY "Allow anon inserts on ez_submissions"
ON ez_submissions
FOR INSERT
WITH CHECK (org_id = 'educazen');

-- RLS Policies for authenticated admin access
CREATE POLICY "Allow admin access on ez_orders"
ON ez_orders
FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access on ez_order_items"
ON ez_order_items
FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin access on ez_submissions"
ON ez_submissions
FOR ALL
USING (auth.role() = 'authenticated');

-- Allow anyone to read (for debugging)
CREATE POLICY "Allow public read on ez_orders"
ON ez_orders
FOR SELECT
USING (true);

CREATE POLICY "Allow public read on ez_order_items"
ON ez_order_items
FOR SELECT
USING (true);

CREATE POLICY "Allow public read on ez_submissions"
ON ez_submissions
FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ez_orders_org ON ez_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_ez_orders_status ON ez_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_ez_order_items_order ON ez_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_ez_submissions_org ON ez_submissions(org_id);
CREATE INDEX IF NOT EXISTS idx_ez_submissions_type ON ez_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_ez_submissions_status ON ez_submissions(status);

-- Function to recalculate order total
CREATE OR REPLACE FUNCTION recalculate_order_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_amount based on related order_items
    UPDATE ez_orders
    SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM ez_order_items
        WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update order total
DROP TRIGGER IF EXISTS order_items_total_trigger ON ez_order_items;
CREATE TRIGGER order_items_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON ez_order_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_order_total();
