"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);
      if (user) {
        supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).single()
          .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAvatarUrl(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] animate-pulse" />;
  }

  if (!user) {
    return (
      <Link href="/auth/login"
        className="surface flex items-center gap-1.5 rounded-full border border-app px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-sm">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
        </svg>
        Sign in
      </Link>
    );
  }

  const initials = (user.user_metadata?.full_name as string || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <Link href="/profile" title="My Profile"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-app hover:ring-2 hover:ring-brand-500/40 transition-all overflow-hidden">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-black text-white">
          {initials}
        </span>
      )}
    </Link>
  );
}
