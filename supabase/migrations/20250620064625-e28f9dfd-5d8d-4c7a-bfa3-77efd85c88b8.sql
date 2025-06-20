
-- Create assignee table
CREATE TABLE public.assignees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  contact_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.assignees ENABLE ROW LEVEL SECURITY;

-- Create policy for assignees - they can view and update their own data
CREATE POLICY "Assignees can view all assignees" 
  ON public.assignees 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Assignees can insert their own data" 
  ON public.assignees 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Assignees can update their own data" 
  ON public.assignees 
  FOR UPDATE 
  TO authenticated
  USING (true);
