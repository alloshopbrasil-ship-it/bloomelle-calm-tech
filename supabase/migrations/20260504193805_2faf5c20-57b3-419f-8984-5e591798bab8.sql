
-- Revoke anon EXECUTE on every SECURITY DEFINER function in public schema
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, public;',
                   f.nspname, f.proname, f.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated;',
                   f.nspname, f.proname, f.args);
  END LOOP;
END
$$;

-- Restrict broad SELECT listing on public buckets: replace blanket bucket SELECT
-- with owner-scoped policies (avatars + community-images). Public read of objects
-- still works via direct URL since buckets are public, but listing/enumeration
-- is restricted to owners.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view community images" ON storage.objects;

CREATE POLICY "Owners can list their avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can list their community images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'community-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
