-- Drop the existing policy
DROP POLICY IF EXISTS "View roles policy" ON public.user_roles;

-- Re-create the policy with a check for a non-null UID
CREATE POLICY "View roles policy"
  ON public.user_roles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR
      public.has_role(auth.uid(), 'admin')
    )
  ); 