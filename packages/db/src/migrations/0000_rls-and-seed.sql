-- Defense-in-depth: lock down direct API access (anon/authenticated roles).
-- The app connects via a privileged direct connection, which is unaffected,
-- but the Supabase PostgREST API can no longer read or mutate these tables.

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."membership_settings" ENABLE ROW LEVEL SECURITY;

-- Seed the singleton membership settings row (id = 1).
INSERT INTO public."membership_settings" (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Custom SQL migration file, put your code below! --