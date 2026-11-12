
CREATE TYPE public.app_role AS ENUM ('customer','driver','admin');
CREATE TYPE public.driver_status AS ENUM ('pending','approved','rejected','suspended');
CREATE TYPE public.order_status AS ENUM ('searching','assigned','arriving_pickup','picked_up','in_transit','delivered','cancelled');

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  usage_intent text CHECK (usage_intent IN ('send','deliver','both')),
  city text DEFAULT 'Lusaka',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- vehicle types (configurable limits)
CREATE TABLE public.vehicle_types (
  code text PRIMARY KEY CHECK (code IN ('bicycle','motorbike','car','cargo')),
  name text NOT NULL,
  tagline text NOT NULL,
  max_weight_kg numeric NOT NULL,
  max_length_cm numeric NOT NULL,
  max_distance_km numeric NOT NULL,
  allows_fragile boolean NOT NULL DEFAULT true,
  speed_kmh numeric NOT NULL,
  sort int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.vehicle_types TO authenticated;
GRANT ALL ON public.vehicle_types TO service_role;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle types read" ON public.vehicle_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle types admin update" ON public.vehicle_types FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.pricing_rules (
  vehicle_type text PRIMARY KEY REFERENCES public.vehicle_types(code),
  currency text NOT NULL DEFAULT 'ZMW',
  base_fare_minor int NOT NULL CHECK (base_fare_minor >= 0),
  per_km_minor int NOT NULL CHECK (per_km_minor >= 0),
  per_kg_minor int NOT NULL DEFAULT 0 CHECK (per_kg_minor >= 0),
  fragile_fee_minor int NOT NULL DEFAULT 0 CHECK (fragile_fee_minor >= 0),
  scheduled_fee_minor int NOT NULL DEFAULT 0 CHECK (scheduled_fee_minor >= 0),
  min_fare_minor int NOT NULL DEFAULT 0 CHECK (min_fare_minor >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.pricing_rules TO authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing read" ON public.pricing_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "pricing admin update" ON public.pricing_rules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.vehicle_types (code,name,tagline,max_weight_kg,max_length_cm,max_distance_km,allows_fragile,speed_kmh,sort) VALUES
('bicycle','Bicycle','Small packages. Small price.',5,40,8,false,14,1),
('motorbike','Motorbike','Quick trips. Big convenience.',20,60,40,true,30,2),
('car','Car','More room for more things.',100,120,150,true,35,3),
('cargo','Cargo','Big deliveries made easy.',1500,400,500,true,30,4);
INSERT INTO public.pricing_rules (vehicle_type,base_fare_minor,per_km_minor,per_kg_minor,fragile_fee_minor,scheduled_fee_minor,min_fare_minor) VALUES
('bicycle',1500,400,0,0,500,2000),
('motorbike',2500,600,50,1000,500,3000),
('car',5000,1000,20,1500,1000,6000),
('cargo',15000,2500,10,3000,2000,20000);

-- drivers
CREATE TABLE public.drivers (
  user_id uuid PRIMARY KEY,
  status public.driver_status NOT NULL DEFAULT 'pending',
  full_name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text NOT NULL REFERENCES public.vehicle_types(code),
  license_number text,
  emergency_contact text,
  payout_method text,
  payout_account text,
  rejection_reason text,
  is_online boolean NOT NULL DEFAULT false,
  last_lat double precision,
  last_lng double precision,
  rating numeric NOT NULL DEFAULT 5.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver own read" ON public.drivers FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(user_id) ON DELETE CASCADE,
  vehicle_type text NOT NULL REFERENCES public.vehicle_types(code),
  registration text,
  make_model text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.vehicles(driver_id);
GRANT SELECT ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle own read" ON public.vehicles FOR SELECT TO authenticated USING (driver_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(user_id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('id','license','vehicle_photo','registration','insurance','profile_photo')),
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.driver_documents(driver_id);
GRANT SELECT, INSERT ON public.driver_documents TO authenticated;
GRANT ALL ON public.driver_documents TO service_role;
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs own read" ON public.driver_documents FOR SELECT TO authenticated USING (driver_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "docs own insert" ON public.driver_documents FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid() AND storage_path LIKE auth.uid()::text || '/%');

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  address text NOT NULL,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.addresses(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addr own" ON public.addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- orders
CREATE TABLE public.delivery_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL UNIQUE DEFAULT ('ZP' || upper(substr(md5(random()::text),1,8))),
  customer_id uuid NOT NULL,
  client_request_id text NOT NULL,
  status public.order_status NOT NULL DEFAULT 'searching',
  vehicle_type text NOT NULL REFERENCES public.vehicle_types(code),
  driver_id uuid,
  scheduled_for timestamptz,
  distance_km numeric NOT NULL,
  duration_min int NOT NULL,
  total_minor int NOT NULL CHECK (total_minor >= 0),
  driver_earnings_minor int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZMW',
  pickup_summary text NOT NULL,
  dropoff_summary text NOT NULL,
  cancel_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, client_request_id)
);
CREATE INDEX ON public.delivery_orders(customer_id, created_at DESC);
CREATE INDEX ON public.delivery_orders(status, vehicle_type);
CREATE INDEX ON public.delivery_orders(driver_id);
GRANT SELECT ON public.delivery_orders TO authenticated;
GRANT ALL ON public.delivery_orders TO service_role;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_order(_order_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.delivery_orders o
    WHERE o.id = _order_id AND (
      o.customer_id = auth.uid()
      OR o.driver_id = auth.uid()
      OR public.has_role(auth.uid(),'admin')
      OR (o.status = 'searching' AND EXISTS (
        SELECT 1 FROM public.drivers d WHERE d.user_id = auth.uid() AND d.status = 'approved' AND d.is_online AND d.vehicle_type = o.vehicle_type))
    )
  )
$$;
CREATE POLICY "order visible" ON public.delivery_orders FOR SELECT TO authenticated USING (public.can_view_order(id));

CREATE TABLE public.delivery_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  seq int NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pickup','dropoff')),
  address text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  instructions text,
  UNIQUE (order_id, seq)
);
GRANT SELECT ON public.delivery_stops TO authenticated;
GRANT ALL ON public.delivery_stops TO service_role;
ALTER TABLE public.delivery_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stops visible" ON public.delivery_stops FOR SELECT TO authenticated USING (public.can_view_order(order_id));

CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  weight_kg numeric NOT NULL CHECK (weight_kg > 0),
  length_cm numeric NOT NULL CHECK (length_cm > 0),
  width_cm numeric NOT NULL CHECK (width_cm > 0),
  height_cm numeric NOT NULL CHECK (height_cm > 0),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  fragile boolean NOT NULL DEFAULT false,
  declared_value_minor int,
  instructions text
);
CREATE INDEX ON public.packages(order_id);
GRANT SELECT ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages visible" ON public.packages FOR SELECT TO authenticated USING (public.can_view_order(order_id));

CREATE TABLE public.delivery_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  breakdown jsonb NOT NULL,
  total_minor int NOT NULL,
  currency text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_quotes TO authenticated;
GRANT ALL ON public.delivery_quotes TO service_role;
ALTER TABLE public.delivery_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes visible" ON public.delivery_quotes FOR SELECT TO authenticated USING (public.can_view_order(order_id));

CREATE TABLE public.delivery_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  actor_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.delivery_status_events(order_id, created_at);
GRANT SELECT ON public.delivery_status_events TO authenticated;
GRANT ALL ON public.delivery_status_events TO service_role;
ALTER TABLE public.delivery_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events visible" ON public.delivery_status_events FOR SELECT TO authenticated USING (public.can_view_order(order_id));

CREATE TABLE public.delivery_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_assignments TO authenticated;
GRANT ALL ON public.delivery_assignments TO service_role;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assign visible" ON public.delivery_assignments FOR SELECT TO authenticated USING (public.can_view_order(order_id));

CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit admin read" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- audit triggers on config tables
CREATE OR REPLACE FUNCTION public.audit_config_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  INSERT INTO public.admin_audit_logs(actor_id, action, entity, entity_id, details)
  VALUES (auth.uid(), 'update', TG_TABLE_NAME, COALESCE(to_jsonb(NEW)->>'code', to_jsonb(NEW)->>'vehicle_type'),
          jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)));
  RETURN NEW;
END $$;
CREATE TRIGGER audit_vehicle_types BEFORE UPDATE ON public.vehicle_types FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();
CREATE TRIGGER audit_pricing_rules BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.audit_config_change();

-- lifecycle
CREATE OR REPLACE FUNCTION public.is_valid_transition(_from public.order_status, _to public.order_status)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT (_from, _to) IN (
    ('searching'::public.order_status,'assigned'::public.order_status),
    ('searching','cancelled'),
    ('assigned','arriving_pickup'),
    ('assigned','cancelled'),
    ('arriving_pickup','picked_up'),
    ('arriving_pickup','cancelled'),
    ('picked_up','in_transit'),
    ('in_transit','delivered')
  )
$$;

CREATE OR REPLACE FUNCTION public.register_driver(_full_name text, _phone text, _vehicle_type text, _license text, _registration text, _make_model text, _emergency text, _payout_method text, _payout_account text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF length(coalesce(_full_name,'')) < 2 OR length(coalesce(_phone,'')) < 6 THEN RAISE EXCEPTION 'Name and phone are required'; END IF;
  IF _vehicle_type <> 'bicycle' AND coalesce(_license,'') = '' THEN RAISE EXCEPTION 'A driver''s licence is required for this vehicle'; END IF;
  IF _vehicle_type <> 'bicycle' AND coalesce(_registration,'') = '' THEN RAISE EXCEPTION 'Vehicle registration is required for this vehicle'; END IF;
  INSERT INTO public.drivers(user_id, full_name, phone, vehicle_type, license_number, emergency_contact, payout_method, payout_account, status)
  VALUES (uid, _full_name, _phone, _vehicle_type, NULLIF(_license,''), _emergency, _payout_method, _payout_account, 'pending')
  ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, vehicle_type = EXCLUDED.vehicle_type,
    license_number = EXCLUDED.license_number, emergency_contact = EXCLUDED.emergency_contact, payout_method = EXCLUDED.payout_method,
    payout_account = EXCLUDED.payout_account, status = CASE WHEN drivers.status = 'rejected' THEN 'pending' ELSE drivers.status END, updated_at = now()
  WHERE drivers.status IN ('pending','rejected');
  INSERT INTO public.vehicles(driver_id, vehicle_type, registration, make_model)
  SELECT uid, _vehicle_type, NULLIF(_registration,''), NULLIF(_make_model,'')
  WHERE NOT EXISTS (SELECT 1 FROM public.vehicles WHERE driver_id = uid AND vehicle_type = _vehicle_type);
  INSERT INTO public.user_roles(user_id, role) VALUES (uid, 'driver') ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.set_driver_online(_online boolean, _lat double precision DEFAULT NULL, _lng double precision DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE st public.driver_status;
BEGIN
  SELECT status INTO st FROM public.drivers WHERE user_id = auth.uid();
  IF st IS NULL THEN RAISE EXCEPTION 'Driver profile not found'; END IF;
  IF _online AND st <> 'approved' THEN RAISE EXCEPTION 'Your account must be approved before going online'; END IF;
  UPDATE public.drivers SET is_online = _online, last_lat = COALESCE(_lat,last_lat), last_lng = COALESCE(_lng,last_lng), updated_at = now() WHERE user_id = auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.accept_order(_order_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.delivery_orders; d public.drivers;
BEGIN
  SELECT * INTO d FROM public.drivers WHERE user_id = auth.uid();
  IF d.user_id IS NULL OR d.status <> 'approved' THEN RAISE EXCEPTION 'Only approved drivers can accept deliveries'; END IF;
  IF NOT d.is_online THEN RAISE EXCEPTION 'Go online to accept deliveries'; END IF;
  IF EXISTS (SELECT 1 FROM public.delivery_orders WHERE driver_id = d.user_id AND status IN ('assigned','arriving_pickup','picked_up','in_transit')) THEN
    RAISE EXCEPTION 'Finish your current delivery first'; END IF;
  SELECT * INTO o FROM public.delivery_orders WHERE id = _order_id FOR UPDATE;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Delivery not found'; END IF;
  IF o.status <> 'searching' THEN RAISE EXCEPTION 'This delivery was already taken'; END IF;
  IF o.vehicle_type <> d.vehicle_type THEN RAISE EXCEPTION 'Your vehicle does not match this delivery'; END IF;
  INSERT INTO public.delivery_assignments(order_id, driver_id) VALUES (o.id, d.user_id);
  UPDATE public.delivery_orders SET status = 'assigned', driver_id = d.user_id, updated_at = now() WHERE id = o.id;
  INSERT INTO public.delivery_status_events(order_id, from_status, to_status, actor_id) VALUES (o.id, 'searching', 'assigned', d.user_id);
END $$;

CREATE OR REPLACE FUNCTION public.advance_order(_order_id uuid, _to public.order_status, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.delivery_orders; uid uuid := auth.uid();
BEGIN
  SELECT * INTO o FROM public.delivery_orders WHERE id = _order_id FOR UPDATE;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Delivery not found'; END IF;
  IF NOT public.is_valid_transition(o.status, _to) OR _to = 'assigned' THEN
    RAISE EXCEPTION 'Cannot move from % to %', o.status, _to; END IF;
  IF _to = 'cancelled' THEN
    IF NOT (o.customer_id = uid OR public.has_role(uid,'admin')) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  ELSE
    IF NOT (o.driver_id = uid OR public.has_role(uid,'admin')) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  END IF;
  UPDATE public.delivery_orders SET status = _to, updated_at = now(), cancel_reason = CASE WHEN _to='cancelled' THEN _note ELSE cancel_reason END WHERE id = o.id;
  INSERT INTO public.delivery_status_events(order_id, from_status, to_status, actor_id, note) VALUES (o.id, o.status, _to, uid, _note);
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_driver_status(_driver_id uuid, _status public.driver_status, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admins only'; END IF;
  UPDATE public.drivers SET status = _status, rejection_reason = _reason,
    is_online = CASE WHEN _status = 'approved' THEN is_online ELSE false END, updated_at = now() WHERE user_id = _driver_id;
  IF _status = 'approved' THEN UPDATE public.vehicles SET approved = true WHERE driver_id = _driver_id; END IF;
  INSERT INTO public.admin_audit_logs(actor_id, action, entity, entity_id, details)
  VALUES (auth.uid(), 'set_status', 'drivers', _driver_id::text, jsonb_build_object('status', _status, 'reason', _reason));
END $$;

REVOKE EXECUTE ON FUNCTION public.register_driver, public.set_driver_online, public.accept_order, public.advance_order, public.admin_set_driver_status FROM anon, public;
GRANT EXECUTE ON FUNCTION public.register_driver, public.set_driver_online, public.accept_order, public.advance_order, public.admin_set_driver_status TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_orders;
