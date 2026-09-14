"use client";

import * as React from "react";
import { Code2 } from "lucide-react";

/** Minimal footer: credit line linking to the developer's site. */
export function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-4 sm:flex-row sm:gap-2">
        <p className="text-xs text-slate-500">
          created &amp; designed by
        </p>
        <a
          href="https://omarelshemy.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 transition-colors hover:text-[#8b7435]"
        >
          <Code2 className="h-3.5 w-3.5 text-[#C9A962]" />
          omar elshemy
        </a>
      </div>
    </footer>
  );
}
