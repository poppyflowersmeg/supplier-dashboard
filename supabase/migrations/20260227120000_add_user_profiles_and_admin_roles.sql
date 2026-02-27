-- ============================================================
-- 1. user_profiles table
-- ============================================================
CREATE TABLE public.user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  is_admin   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "admins can read all profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.is_admin = true));

CREATE POLICY "admins can update profiles" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.is_admin = true));

-- ============================================================
-- 2. Seed existing users (meg = admin, others = non-admin)
-- ============================================================
INSERT INTO public.user_profiles (id, email, is_admin)
SELECT id, email,
  CASE WHEN email ILIKE 'meg@poppyflowers.com' THEN true ELSE false END
FROM auth.users;

-- ============================================================
-- 3. Auto-create profile on new signups
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. is_admin() helper function
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 5. Replace write policies on public tables
-- ============================================================

-- suppliers
DROP POLICY "allow insert" ON public.suppliers;
DROP POLICY "allow update" ON public.suppliers;
DROP POLICY "allow delete" ON public.suppliers;

CREATE POLICY "allow insert" ON public.suppliers FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "allow update" ON public.suppliers FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "allow delete" ON public.suppliers FOR DELETE TO authenticated
  USING (public.is_admin());

-- catalogItems
DROP POLICY "allow insert" ON public."catalogItems";
DROP POLICY "allow update" ON public."catalogItems";
DROP POLICY "allow delete" ON public."catalogItems";

CREATE POLICY "allow insert" ON public."catalogItems" FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "allow update" ON public."catalogItems" FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "allow delete" ON public."catalogItems" FOR DELETE TO authenticated
  USING (public.is_admin());

-- supplierCatalogs
DROP POLICY "allow insert" ON public."supplierCatalogs";
DROP POLICY "allow delete" ON public."supplierCatalogs";

CREATE POLICY "allow insert" ON public."supplierCatalogs" FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY "allow delete" ON public."supplierCatalogs" FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 6. Replace storage write policies
-- ============================================================
DROP POLICY "supplier-catalogs allow insert" ON storage.objects;
DROP POLICY "supplier-catalogs allow delete" ON storage.objects;

CREATE POLICY "supplier-catalogs allow insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'supplier-catalogs' AND public.is_admin());
CREATE POLICY "supplier-catalogs allow delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'supplier-catalogs' AND public.is_admin());
