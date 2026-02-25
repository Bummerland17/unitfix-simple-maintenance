
-- Create profiles table for landlords
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can view own properties" ON public.properties FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can create properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = landlord_id);

-- Create units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  public_request_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Landlords see units for their own properties
CREATE POLICY "Landlords can view own units" ON public.units FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = units.property_id AND landlord_id = auth.uid())
);
CREATE POLICY "Landlords can create units" ON public.units FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.properties WHERE id = units.property_id AND landlord_id = auth.uid())
);
CREATE POLICY "Landlords can update own units" ON public.units FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = units.property_id AND landlord_id = auth.uid())
);
CREATE POLICY "Landlords can delete own units" ON public.units FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = units.property_id AND landlord_id = auth.uid())
);

-- Create maintenance_requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  tenant_contact TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Medium', 'High')),
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed')),
  internal_notes TEXT,
  estimated_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Landlords can view requests for their own units
CREATE POLICY "Landlords can view own requests" ON public.maintenance_requests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.properties p ON u.property_id = p.id
    WHERE u.id = maintenance_requests.unit_id AND p.landlord_id = auth.uid()
  )
);

-- Landlords can update their own requests
CREATE POLICY "Landlords can update own requests" ON public.maintenance_requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.units u
    JOIN public.properties p ON u.property_id = p.id
    WHERE u.id = maintenance_requests.unit_id AND p.landlord_id = auth.uid()
  )
);

-- Public: anyone can insert a request (tenant submission via public token)
CREATE POLICY "Anyone can create requests" ON public.maintenance_requests FOR INSERT WITH CHECK (true);

-- Public: allow anonymous users to look up units by token for the public form
CREATE POLICY "Anyone can view units by token" ON public.units FOR SELECT USING (true);

-- Storage bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-photos', 'maintenance-photos', true);

CREATE POLICY "Anyone can upload maintenance photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maintenance-photos');
CREATE POLICY "Anyone can view maintenance photos" ON storage.objects FOR SELECT USING (bucket_id = 'maintenance-photos');
