import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: string[] = [];

  // Step 1: Drop the old UUID constraint/default, alter column to TEXT
  const { error: e1 } = await supabase.rpc("exec_sql" as any, {
    query: `
      ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_template_id_fkey;
      ALTER TABLE invitations ALTER COLUMN template_id DROP DEFAULT;
      ALTER TABLE invitations ALTER COLUMN template_id TYPE TEXT USING template_id::TEXT;
      ALTER TABLE invitations ALTER COLUMN template_id SET DEFAULT '1';
    `,
  });

  // If rpc doesn't exist, try raw SQL approach
  if (e1) {
    // Try each statement individually via the REST API
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`;

    // Alternative: just try to update - if column is already text type, this will work
    const { data: testUpdate, error: testErr } = await supabase
      .from("invitations")
      .update({ template_id: "1" })
      .eq("id", "00000000-0000-0000-0000-000000000000");

    results.push(`Test update result: ${testErr?.message || "ok"}`);
  }

  // Step 2: Ensure all invitations have template_id = '1'
  const { data: invs, error: fetchErr } = await supabase
    .from("invitations")
    .select("id, template_id");

  if (fetchErr) {
    return NextResponse.json({
      success: false,
      error: `Cannot read invitations: ${fetchErr.message}`,
      hint: "Column may not exist yet. Run this SQL in Supabase Dashboard SQL Editor:\n\nALTER TABLE invitations ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT '1';\nUPDATE invitations SET template_id = '1' WHERE template_id IS NULL;",
      results,
    });
  }

  // Update any null template_ids
  const nullIds = invs?.filter((i) => !i.template_id).map((i) => i.id) || [];
  if (nullIds.length > 0) {
    await supabase
      .from("invitations")
      .update({ template_id: "1" })
      .in("id", nullIds);
    results.push(`Fixed ${nullIds.length} invitations with null template_id`);
  }

  // Update sample wedding
  await supabase
    .from("invitations")
    .update({ template_id: "1" })
    .eq("slug", "sample-wedding-2026");
  results.push("Set sample-wedding-2026 to template 1");

  return NextResponse.json({
    success: true,
    totalInvitations: invs?.length || 0,
    results,
  });
}
