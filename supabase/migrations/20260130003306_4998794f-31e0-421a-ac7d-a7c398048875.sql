-- Create enums for the application
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.event_status AS ENUM ('Available', 'Expired', 'Unavailable', 'Finished');
CREATE TYPE public.gateway_type AS ENUM ('Groovoo Square', 'Groovoo Stripe', 'Split Stripe', 'Organizer Square', 'Organizer Stripe');
CREATE TYPE public.ticket_priority AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE public.ticket_status AS ENUM ('Open', 'In Progress', 'Waiting', 'Resolved', 'Closed');
CREATE TYPE public.ticket_type AS ENUM ('B2C', 'B2B');
CREATE TYPE public.platform_type AS ENUM ('iOS', 'Android', 'Web');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  status event_status NOT NULL DEFAULT 'Available',
  gateway gateway_type NOT NULL,
  event_date DATE NOT NULL,
  payout_date DATE NOT NULL,
  gross_sale NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  gateway_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_sale NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  payout_executed BOOLEAN NOT NULL DEFAULT false,
  fees_received BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  ticket_type ticket_type NOT NULL,
  category TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'Medium',
  status ticket_status NOT NULL DEFAULT 'Open',
  platform platform_type,
  assignee_id UUID REFERENCES auth.users(id),
  move_to_backlog BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create ticket_attachments table
CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create knowledge_base table
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Create helper function to check if user is staff or admin
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
$$;

-- Function to calculate payout date (3 workdays after event date)
CREATE OR REPLACE FUNCTION public.calculate_payout_date(event_date DATE)
RETURNS DATE
LANGUAGE plpgsql
AS $$
DECLARE
  result_date DATE := event_date;
  days_added INTEGER := 0;
BEGIN
  WHILE days_added < 3 LOOP
    result_date := result_date + 1;
    -- Skip weekends (0 = Sunday, 6 = Saturday)
    IF EXTRACT(DOW FROM result_date) NOT IN (0, 6) THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  RETURN result_date;
END;
$$;

-- Trigger to auto-calculate payout date on events insert/update
CREATE OR REPLACE FUNCTION public.set_payout_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.payout_date := public.calculate_payout_date(NEW.event_date);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_payout_date
BEFORE INSERT OR UPDATE OF event_date ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_payout_date();

-- Trigger to auto-log payout/fee status changes
CREATE OR REPLACE FUNCTION public.log_event_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email_val TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email_val FROM public.profiles WHERE id = auth.uid();
  
  -- Log payout status change
  IF OLD.payout_executed IS DISTINCT FROM NEW.payout_executed THEN
    INSERT INTO public.audit_log (user_id, user_email, action, entity_type, entity_id, old_value, new_value)
    VALUES (
      auth.uid(),
      user_email_val,
      'Payout Status Changed',
      'event',
      NEW.id::TEXT,
      jsonb_build_object('payout_executed', OLD.payout_executed),
      jsonb_build_object('payout_executed', NEW.payout_executed)
    );
  END IF;
  
  -- Log fees received change
  IF OLD.fees_received IS DISTINCT FROM NEW.fees_received THEN
    INSERT INTO public.audit_log (user_id, user_email, action, entity_type, entity_id, old_value, new_value)
    VALUES (
      auth.uid(),
      user_email_val,
      'Fees Status Changed',
      'event',
      NEW.id::TEXT,
      jsonb_build_object('fees_received', OLD.fees_received),
      jsonb_build_object('fees_received', NEW.fees_received)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_event_status_change
AFTER UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.log_event_status_change();

-- Auto-create profile and assign default staff role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_knowledge_base_updated_at
BEFORE UPDATE ON public.knowledge_base
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- User roles policies (read-only for users, managed by system)
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin());

-- Events policies
CREATE POLICY "Authenticated users can view events"
ON public.events FOR SELECT
TO authenticated
USING (public.is_authenticated_user());

CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
TO authenticated
USING (public.is_admin());

-- Tickets policies
CREATE POLICY "Authenticated users can view tickets"
ON public.tickets FOR SELECT
TO authenticated
USING (public.is_authenticated_user());

CREATE POLICY "Admins can insert tickets"
ON public.tickets FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tickets"
ON public.tickets FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete tickets"
ON public.tickets FOR DELETE
TO authenticated
USING (public.is_admin());

-- Ticket attachments policies
CREATE POLICY "Authenticated users can view attachments"
ON public.ticket_attachments FOR SELECT
TO authenticated
USING (public.is_authenticated_user());

CREATE POLICY "Admins can manage attachments"
ON public.ticket_attachments FOR ALL
TO authenticated
USING (public.is_admin());

-- Audit log policies (everyone can read, system writes)
CREATE POLICY "Authenticated users can view audit log"
ON public.audit_log FOR SELECT
TO authenticated
USING (public.is_authenticated_user());

-- Knowledge base policies
CREATE POLICY "Authenticated users can view knowledge base"
ON public.knowledge_base FOR SELECT
TO authenticated
USING (public.is_authenticated_user());

CREATE POLICY "Admins can insert knowledge base"
ON public.knowledge_base FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update knowledge base"
ON public.knowledge_base FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete knowledge base"
ON public.knowledge_base FOR DELETE
TO authenticated
USING (public.is_admin());