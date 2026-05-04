
-- Trigger-only functions: revoke EXECUTE from authenticated as well.
-- Triggers fire as table owner, no EXECUTE grant required.
REVOKE EXECUTE ON FUNCTION public.notify_on_like() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_on_comment() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_on_follow() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rate_limit_comments() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rate_limit_messages() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rate_limit_notifications() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rate_limit_posts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_content_length() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_goal_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_journal_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_daily_post_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_group_membership_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.start_user_trial() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
