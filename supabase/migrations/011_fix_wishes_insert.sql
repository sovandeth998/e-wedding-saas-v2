-- Fix: FOR ALL policy blocked anonymous wish inserts
-- (WITH CHECK defaults to USING which requires auth.uid() - fails for anonymous)

DROP POLICY IF EXISTS "Users can manage wishes for own invitations" ON wishes;

CREATE POLICY "Owners can update wishes" ON wishes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

CREATE POLICY "Owners can delete wishes" ON wishes FOR DELETE USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
