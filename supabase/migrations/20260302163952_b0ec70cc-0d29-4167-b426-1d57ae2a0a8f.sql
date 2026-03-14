
-- Fix security definer view issue by using SECURITY INVOKER
ALTER VIEW public.profiles_public SET (security_invoker = on);
