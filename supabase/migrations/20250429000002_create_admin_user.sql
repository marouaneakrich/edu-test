-- Create admin user for admin@educazenkids.com
-- This migration creates the admin user role assignment

-- First, we need to get the user ID from auth.users
-- This will be done manually via Supabase dashboard or by creating the user first
-- Then we insert the role assignment

-- Note: You need to create the user in Supabase Auth first, then run:
-- INSERT INTO ez_user_roles (user_id, role, username, display_name)
-- VALUES ('<user_uuid>', 'admin', 'admin', 'Admin');

-- For now, this is a placeholder - you'll need to create the user via Supabase dashboard
-- and then manually insert the role assignment
