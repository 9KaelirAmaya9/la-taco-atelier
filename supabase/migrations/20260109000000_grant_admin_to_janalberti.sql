-- Grant admin role to janalberti@live.com
-- This fixes the admin login issue by ensuring the user has admin access

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'janalberti@live.com'
ON CONFLICT (user_id, role) DO NOTHING;
