-- AGENCY RESCUE SCRIPT (v2)
-- This script resets all policies and sets up the most robust version of RBAC.
-- Run this in the Supabase SQL Editor.

-- 1. CLEANUP ALL POLICIES
DO $$ 
DECLARE 
    tab TEXT;
    pol TEXT;
BEGIN
    FOR tab, pol IN 
        SELECT tablename, policyname FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('agencies', 'agency_members', 'prospects', 'appointments', 'prospect_notes', 'agency_invitations', 'profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol, tab);
    END LOOP;
END $$;

-- 2. RESET HELPERS
CREATE OR REPLACE FUNCTION public.is_agency_admin(target_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = target_agency_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  ) OR EXISTS (
    SELECT 1 FROM public.agencies
    WHERE id = target_agency_id
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_agency_member(target_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = target_agency_id
    AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.agencies
    WHERE id = target_agency_id
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_agency_owner(target_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = target_agency_id
    AND user_id = auth.uid()
    AND role = 'owner'
  ) OR EXISTS (
    SELECT 1 FROM public.agencies
    WHERE id = target_agency_id
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. APPLY POLICIES

-- AGENCIES
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agencies_all" ON agencies FOR ALL USING (
    owner_id = auth.uid() 
    OR is_agency_member(id)
    OR EXISTS (SELECT 1 FROM agency_invitations WHERE agency_id = agencies.id AND lower(email) = lower(auth.jwt() ->> 'email') AND status = 'pending')
);

-- AGENCY_MEMBERS
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_select" ON agency_members FOR SELECT USING (is_agency_member(agency_id));
CREATE POLICY "members_admin" ON agency_members FOR ALL USING (is_agency_admin(agency_id));
CREATE POLICY "members_join" ON agency_members FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
        EXISTS (SELECT 1 FROM agency_invitations WHERE agency_id = agency_members.agency_id AND lower(email) = lower(auth.jwt() ->> 'email') AND status = 'pending')
        OR
        EXISTS (SELECT 1 FROM agencies WHERE id = agency_members.agency_id AND owner_id = auth.uid())
    )
);

-- PROFILES (The critical one)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_owner" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "profiles_team" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM agency_members 
        WHERE user_id = profiles.id 
        AND is_agency_member(agency_id)
    )
);

-- DATA TABLES
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prospects_rbac" ON prospects FOR ALL USING (user_id = auth.uid() OR is_agency_member(agency_id));

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_rbac" ON appointments FOR ALL USING (user_id = auth.uid() OR is_agency_member(agency_id));

ALTER TABLE prospect_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_rbac" ON prospect_notes FOR ALL USING (user_id = auth.uid() OR is_agency_member(agency_id));

-- INVITATIONS
ALTER TABLE agency_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitations_rbac" ON agency_invitations FOR SELECT USING (lower(email) = lower(auth.jwt() ->> 'email') OR is_agency_admin(agency_id));
CREATE POLICY "invitations_owner_manage" ON agency_invitations FOR ALL USING (is_agency_owner(agency_id));
CREATE POLICY "invitations_accept" ON agency_invitations FOR UPDATE USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- 4. ENSURE OWNER IS LISTED AS MEMBER (Rescue operation)
-- This query helps Sebastian register himself as 'owner' if he missed it.
INSERT INTO agency_members (agency_id, user_id, role)
SELECT id, owner_id, 'owner'
FROM agencies
ON CONFLICT (agency_id, user_id) 
DO UPDATE SET role = 'owner';

-- 5. ENSURE RELATIONSHIP FOR JOINS (The fix for STAGE 2)
-- This allows Supabase/PostgREST to "see" the relationship between members and profiles.
ALTER TABLE public.agency_members 
DROP CONSTRAINT IF EXISTS agency_members_user_id_profiles_fkey;

ALTER TABLE public.agency_members
ADD CONSTRAINT agency_members_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
