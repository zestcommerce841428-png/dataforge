import { createClient as createAdmin, type User } from "@supabase/supabase-js";
import { createHash } from "crypto";

export function makeAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type Admin = ReturnType<typeof makeAdmin>;

/** SHA-256 of the code salted with the service-role key (never stored plaintext). */
export function hashCode(code: string) {
  return createHash("sha256").update(code + process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex");
}

/** Look up a user by email via the admin API (paginated scan). */
export async function findUserByEmail(admin: Admin, email: string): Promise<User | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 1000) break;
  }
  return null;
}
