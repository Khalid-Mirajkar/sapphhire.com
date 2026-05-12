
-- 1) Auto-create profile on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Dedupe newsletter_subscribers and add UNIQUE(email)
DELETE FROM public.newsletter_subscribers a
USING public.newsletter_subscribers b
WHERE a.ctid < b.ctid
  AND a.email = b.email;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);
