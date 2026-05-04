
-- 1. password_reset_tokens: explicit restrictive deny-all for client roles
-- (service_role bypasses RLS, so backend still works)
CREATE POLICY "Deny all client access to reset tokens"
ON public.password_reset_tokens
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- 2. moderation_flags: allow admins and moderators to view all
CREATE POLICY "Admins and moderators can view all flags"
ON public.moderation_flags
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'moderator'::app_role)
);

-- 3. Revoke EXECUTE from anon on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.get_safe_community_posts() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_safe_community_posts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
