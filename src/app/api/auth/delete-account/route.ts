import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete profile row (cascades via FK if needed)
  await supabase.from("profiles").delete().eq("id", user.id);

  // Use admin client to fully delete from auth.users
  const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (adminUrl && serviceKey) {
    const admin = createAdmin(adminUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await admin.auth.admin.deleteUser(user.id);
  }

  // Sign out the current session
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
