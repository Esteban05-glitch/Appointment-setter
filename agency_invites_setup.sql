-- Agency Invitations Table
CREATE TABLE IF NOT EXISTS agency_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'setter' CHECK (role IN ('admin', 'setter')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  UNIQUE(agency_id, email, status) -- prevent duplicate pending invites
);

-- RLS for Invitations
ALTER TABLE agency_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites for their agency" ON agency_invitations
  FOR SELECT USING (
    agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can create invites" ON agency_invitations
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Admins can delete/cancel invites" ON agency_invitations
  FOR DELETE USING (
    agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Trigger to automatically add member when invite is accepted (conceptual, usually handled in API/Edge Function)
-- For now, we'll handle the "acceptance" in the frontend by checking for pending invites for the user's email.
