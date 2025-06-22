
-- Make odaybakour2@gmail.com an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'odaybakour2@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
