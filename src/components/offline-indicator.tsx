"use client";

import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const off = () => setOffline(true);
    const on  = () => { setOffline(false); setShowBack(true); setTimeout(() => setShowBack(false), 3000); };
    window.addEventListener("offline", off);
    window.addEventListener("online",  on);
    setOffline(!navigator.onLine);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); };
  }, []);

  if (!offline && !showBack) return null;

  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all ${
        offline ? "bg-red-600 text-white" : "bg-green-600 text-white"
      }`}>
      <span className={`h-2 w-2 rounded-full ${offline ? "bg-red-300 animate-pulse" : "bg-green-300"}`} />
      {offline ? "You are offline — generators still work" : "Back online"}
    </div>
  );
}
