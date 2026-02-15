-- Create Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  job_title TEXT,
  goals JSONB DEFAULT '{"monthlyCommission": 5000, "dailyCalls": 50}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Prospects table
CREATE TABLE prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT,
  handle TEXT,
  status TEXT DEFAULT 'new_lead',
  priority TEXT DEFAULT 'medium',
  value NUMERIC DEFAULT 0,
  last_contact TEXT,
  qual_budget BOOLEAN DEFAULT FALSE,
  qual_authority BOOLEAN DEFAULT FALSE,
  qual_need BOOLEAN DEFAULT FALSE,
  qual_timing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create Prospect Notes table
CREATE TABLE prospect_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Prospect Notes
CREATE POLICY "Users can view notes of their own prospects" ON prospect_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notes for their own prospects" ON prospect_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospect notes" ON prospect_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user entries in profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Prospects
CREATE POLICY "Users can view their own prospects" ON prospects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prospects" ON prospects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects" ON prospects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects" ON prospects
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user entries in profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, job_title)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'Appointment Setter');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
