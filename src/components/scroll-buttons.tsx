"use client";

import { useEffect, useState, useCallback } from "react";

export function ScrollButtons() {
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  const update = useCallback(() => {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    setVisible(scrollY > 200);
    setAtBottom(scrollY + winH >= docH - 40);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 right-5 z-50 flex flex-col gap-2"
      role="group"
      aria-label="Page scroll controls"
    >
      <button
        type="button"
        onClick={scrollTop}
        aria-label="Scroll to top"
        title="Back to top"
        className={`
          group flex h-10 w-10 items-center justify-center rounded-full border shadow-lg
          transition-all duration-200 hover:scale-110 active:scale-95
          ${atBottom
            ? "border-brand-500/40 bg-brand-600 text-white hover:bg-brand-700"
            : "surface border-app text-muted hover:border-brand-400 hover:text-brand-600"
          }
        `}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 10l5-5 5 5" />
        </svg>
      </button>

      <button
        type="button"
        onClick={scrollBottom}
        aria-label="Scroll to bottom"
        title="Jump to bottom"
        className={`
          flex h-10 w-10 items-center justify-center rounded-full border shadow-lg
          transition-all duration-200 hover:scale-110 active:scale-95
          ${atBottom
            ? "surface border-app text-muted hover:border-brand-400 hover:text-brand-600"
            : "surface border-app text-muted hover:border-brand-400 hover:text-brand-600"
          }
        `}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </button>
    </div>
  );
}
