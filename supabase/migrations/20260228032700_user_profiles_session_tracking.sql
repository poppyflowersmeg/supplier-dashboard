-- 1. Add session tracking columns
ALTER TABLE public."userProfiles"
  ADD COLUMN "lastSessionAt" TIMESTAMPTZ,
  ADD COLUMN "numSessions" INTEGER NOT NULL DEFAULT 0;

-- 2. Update handle_new_user() to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."userProfiles" (id, email, "isAdmin", "canManageUsers", "lastSessionAt", "numSessions")
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    false,
    false,
    NULL,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Allow users to update their own session fields
CREATE POLICY "users can update own session" ON public."userProfiles"
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
