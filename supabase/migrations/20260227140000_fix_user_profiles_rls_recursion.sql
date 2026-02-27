-- Fix infinite recursion in userProfiles RLS policies.
-- The old policies queried userProfiles inline to check canManageUsers,
-- which triggered the same policies again. This uses a SECURITY DEFINER
-- function instead, which bypasses RLS.

CREATE OR REPLACE FUNCTION public.can_manage_users()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."userProfiles"
    WHERE id = auth.uid() AND "canManageUsers" = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

DROP POLICY "managers can read all profiles" ON public."userProfiles";
DROP POLICY "managers can insert profiles" ON public."userProfiles";
DROP POLICY "managers can update profiles" ON public."userProfiles";
DROP POLICY "managers can delete profiles" ON public."userProfiles";

CREATE POLICY "managers can read all profiles" ON public."userProfiles"
  FOR SELECT TO authenticated
  USING (public.can_manage_users());

CREATE POLICY "managers can insert profiles" ON public."userProfiles"
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_users());

CREATE POLICY "managers can update profiles" ON public."userProfiles"
  FOR UPDATE TO authenticated
  USING (public.can_manage_users())
  WITH CHECK (public.can_manage_users());

CREATE POLICY "managers can delete profiles" ON public."userProfiles"
  FOR DELETE TO authenticated
  USING (public.can_manage_users());
