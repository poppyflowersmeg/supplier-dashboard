-- RPC function to atomically track a session for the calling user
CREATE OR REPLACE FUNCTION public.track_session()
RETURNS VOID AS $$
  UPDATE public."userProfiles"
  SET "lastSessionAt" = now(),
      "numSessions" = "numSessions" + 1
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';
