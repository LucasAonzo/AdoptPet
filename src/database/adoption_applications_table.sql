-- SQL command to create the adoption_applications table in Supabase

-- First, ensure the uuid extension is enabled (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.adoption_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  application_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Ensure uniqueness of applications per user+animal pair
  CONSTRAINT unique_user_animal_application UNIQUE (user_id, animal_id),
  
  -- Validate status values
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  
  -- Add foreign key constraints with appropriate references
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_animal FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_adoption_applications_user_id ON public.adoption_applications(user_id);
CREATE INDEX idx_adoption_applications_animal_id ON public.adoption_applications(animal_id);
CREATE INDEX idx_adoption_applications_status ON public.adoption_applications(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
  ON public.adoption_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create their own applications"
  ON public.adoption_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ADMIN POLICY OPTIONS - Choose one of these approaches:

-- OPTION 1: Enable superuser access (simplest approach for development)
-- This allows the service role (superuser) to manage all applications
CREATE POLICY "Service role can manage all applications"
  ON public.adoption_applications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- OPTION 2: Create a separate admins table (commented out - implement if needed)
/*
-- First create an admins table if you haven't already
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Then create a policy that uses this table
CREATE POLICY "Admins can update applications"
  ON public.adoption_applications FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.admins));
*/

-- Comment on table and columns for documentation
COMMENT ON TABLE public.adoption_applications IS 'Stores animal adoption applications submitted by users';
COMMENT ON COLUMN public.adoption_applications.application_data IS 'JSON data containing all application form fields';
COMMENT ON COLUMN public.adoption_applications.status IS 'Current status of the application: pending, approved, rejected, or cancelled';

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_adoption_applications_updated_at
BEFORE UPDATE ON public.adoption_applications
FOR EACH ROW EXECUTE PROCEDURE update_modified_column(); 