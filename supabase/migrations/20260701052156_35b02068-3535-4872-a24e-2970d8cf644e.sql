
-- 1. Fix orders INSERT: enforce user_id null or own
DROP POLICY IF EXISTS "Anyone create order" ON public.orders;
CREATE POLICY "Anyone create order" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 2. Fix reservations INSERT: enforce user_id null or own
DROP POLICY IF EXISTS "Anyone create reservation" ON public.reservations;
CREATE POLICY "Anyone create reservation" ON public.reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3. Fix order_items INSERT: must reference your own order (or a very recent guest order)
DROP POLICY IF EXISTS "Anyone insert order items" ON public.order_items;
CREATE POLICY "Insert items for own order" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.user_id = auth.uid()
          OR (o.user_id IS NULL AND o.created_at > now() - interval '10 minutes')
        )
    )
  );

-- 4. Guest reservation read: allow authenticated users to read reservations
-- they created after signup by matching guest_email to their auth email
CREATE POLICY "Users read reservations by matching email"
  ON public.reservations
  FOR SELECT TO authenticated
  USING (
    guest_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 5. Convert has_role to SECURITY INVOKER — it's only ever called with auth.uid()
-- and "Users read own roles" policy allows this. Removes DEFINER attack surface.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. Tighten lookup_tracking: validate input, keep SECURITY DEFINER (required to allow
-- guests to look up their own orders/reservations by unguessable code without exposing
-- PII to broad SELECT policies). Function returns only non-sensitive fields.
CREATE OR REPLACE FUNCTION public.lookup_tracking(_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  o public.orders%ROWTYPE;
  r public.reservations%ROWTYPE;
BEGIN
  -- Strict input validation: only accept our tracking-code format OUR-XXXXXX (6 upper hex chars)
  IF _code IS NULL OR _code !~ '^OUR-[A-F0-9]{6}$' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO o FROM public.orders WHERE tracking_code = _code;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'kind','order','id',o.id,'status',o.status,'tracking_code',o.tracking_code,
      'guest_name',o.guest_name,'fulfillment',o.fulfillment,'total_cents',o.total_cents,
      'created_at',o.created_at,'updated_at',o.updated_at);
  END IF;
  SELECT * INTO r FROM public.reservations WHERE tracking_code = _code;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'kind','reservation','id',r.id,'status',r.status,'tracking_code',r.tracking_code,
      'guest_name',r.guest_name,'party_size',r.party_size,'reserved_for',r.reserved_for,
      'created_at',r.created_at,'updated_at',r.updated_at);
  END IF;
  RETURN NULL;
END; $function$;

-- Lock function execution: PUBLIC revoked, only anon/authenticated (needed for guest & customer tracking)
REVOKE ALL ON FUNCTION public.lookup_tracking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_tracking(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- 7. user_roles: add explicit deny-by-default guard by ensuring no INSERT/UPDATE/DELETE
-- policy exists besides the admin-only "Admins manage roles". Recreate to be explicit
-- and role-scoped (authenticated only — anon can never touch roles).
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
