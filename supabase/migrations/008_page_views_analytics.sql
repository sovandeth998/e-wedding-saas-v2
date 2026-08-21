CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_hash TEXT
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view page views for own invitations" ON page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all page views" ON page_views FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_page_views_invitation_id ON page_views(invitation_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
