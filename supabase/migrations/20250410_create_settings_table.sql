
-- Create settings table to store application settings
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read settings (public readable)
CREATE POLICY "Settings are readable by everyone" 
  ON public.settings 
  FOR SELECT 
  USING (true);

-- Create policy to allow only authenticated users to modify settings
CREATE POLICY "Only authenticated users can modify settings" 
  ON public.settings 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create policy to allow only authenticated users to insert settings
CREATE POLICY "Only authenticated users can insert settings" 
  ON public.settings 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
