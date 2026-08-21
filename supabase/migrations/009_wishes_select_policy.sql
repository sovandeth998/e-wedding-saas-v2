CREATE POLICY "Owners can view all wishes for own invitations" ON wishes FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
