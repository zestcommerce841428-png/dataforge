import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white shadow-sm">
          ⚡
        </span>
        <span className="text-xl font-extrabold tracking-tight">
          Data<span className="text-brand-600">Forge</span>
        </span>
      </Link>
      {children}
    </div>
  );
}
