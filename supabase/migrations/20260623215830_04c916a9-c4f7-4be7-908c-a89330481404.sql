REVOKE SELECT (flag_reason) ON public.community_posts FROM anon, authenticated;
GRANT SELECT (flag_reason) ON public.community_posts TO service_role;