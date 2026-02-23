-- AGENCY SYSTEM - FASE 1: INFRASTRUCTURE

-- 1. Create Agencies table
CREATE TABLE agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Agency Members table
CREATE TABLE agency_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'setter')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(agency_id, user_id)
);

-- 3. Add agency_id to existing tables
ALTER TABLE prospects ADD COLUMN agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE;
ALTER TABLE prospect_notes ADD COLUMN agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Agencies
CREATE POLICY "Users can view their own agency" ON agencies
  FOR SELECT USING (
    id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can update their agency" ON agencies
  FOR UPDATE USING (owner_id = auth.uid());

-- 6. RLS Policies for Agency Members
CREATE POLICY "Members can view their teammates" ON agency_members
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
  );

-- 7. UPDATE EXISTING RLS POLICIES (IMPORTANT)
-- We change from "own data" to "agency data"

-- Prospects
DROP POLICY IF EXISTS "Users can view their own prospects" ON prospects;
CREATE POLICY "Users can view agency prospects" ON prospects
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    OR user_id = auth.uid() -- fallback for users without agency yet
  );

-- Repeat similar logic for other tables during implementation...
