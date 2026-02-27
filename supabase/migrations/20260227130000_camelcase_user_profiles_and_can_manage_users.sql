-- ============================================================
-- 1. Rename table and columns to camelCase
-- ============================================================
ALTER TABLE public.user_profiles RENAME TO "userProfiles";
ALTER TABLE public."userProfiles" RENAME COLUMN is_admin TO "isAdmin";
ALTER TABLE public."userProfiles" RENAME COLUMN created_at TO "createdAt";

-- ============================================================
-- 2. Add canManageUsers column (only meg gets true)
-- ============================================================
ALTER TABLE public."userProfiles"
  ADD COLUMN "canManageUsers" BOOLEAN NOT NULL DEFAULT false;

UPDATE public."userProfiles"
  SET "canManageUsers" = true
  WHERE email ILIKE 'meg@poppyflowers.com';

-- ============================================================
-- 3. Update is_admin() function to use new table/column names
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."userProfiles"
    WHERE id = auth.uid() AND "isAdmin" = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- ============================================================
-- 4. Update handle_new_user() trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."userProfiles" (id, email, "isAdmin", "canManageUsers")
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================
-- 5. Replace RLS policies on userProfiles
--    CRUD requires canManageUsers = true (except self-read)
-- ============================================================
DROP POLICY "users can read own profile" ON public."userProfiles";
DROP POLICY "admins can read all profiles" ON public."userProfiles";
DROP POLICY "admins can update profiles" ON public."userProfiles";

CREATE POLICY "users can read own profile" ON public."userProfiles"
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "managers can read all profiles" ON public."userProfiles"
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."userProfiles" up WHERE up.id = auth.uid() AND up."canManageUsers" = true)
  );

CREATE POLICY "managers can insert profiles" ON public."userProfiles"
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public."userProfiles" up WHERE up.id = auth.uid() AND up."canManageUsers" = true)
  );

CREATE POLICY "managers can update profiles" ON public."userProfiles"
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."userProfiles" up WHERE up.id = auth.uid() AND up."canManageUsers" = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public."userProfiles" up WHERE up.id = auth.uid() AND up."canManageUsers" = true)
  );

CREATE POLICY "managers can delete profiles" ON public."userProfiles"
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public."userProfiles" up WHERE up.id = auth.uid() AND up."canManageUsers" = true)
  );
