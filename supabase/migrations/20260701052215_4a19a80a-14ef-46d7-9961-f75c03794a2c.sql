
-- Revoke API execute on trigger-only functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Move lookup_tracking's DEFINER-required logic behind a wrapper.
-- Keep the guest tracking feature: only the RPC surface is public, and it
-- validates input format strictly. Nothing else changes.
-- (Ensure explicit grants remain narrow.)
REVOKE ALL ON FUNCTION public.lookup_tracking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_tracking(text) TO anon, authenticated;
