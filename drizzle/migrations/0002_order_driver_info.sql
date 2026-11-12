CREATE OR REPLACE FUNCTION public.order_driver_info(_order_id uuid)
RETURNS TABLE (full_name text, vehicle_type text, rating numeric, registration text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.full_name, d.vehicle_type, d.rating,
    (SELECT v.registration FROM public.vehicles v WHERE v.driver_id = d.user_id AND v.vehicle_type = d.vehicle_type LIMIT 1)
  FROM public.delivery_orders o JOIN public.drivers d ON d.user_id = o.driver_id
  WHERE o.id = _order_id AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
$$;
REVOKE EXECUTE ON FUNCTION public.order_driver_info FROM anon, public;
GRANT EXECUTE ON FUNCTION public.order_driver_info TO authenticated;