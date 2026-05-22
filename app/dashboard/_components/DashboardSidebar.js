"use client";

import { useState } from "react";
import Link from "next/link";
import CustomUserButton from "../../_components/auth/CustomUserButton";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`hidden md:flex flex-col border-r border-gh-border bg-gh-header transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="p-4 flex items-center justify-between border-b border-gh-border h-16">
        <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${collapsed ? "justify-center w-full" : ""}`}>
          <span className="material-symbols-outlined text-white text-2xl">terminal</span>
          {!collapsed && <span className="text-white font-bold tracking-tight text-lg">PRDbot</span>}
        </Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="text-gh-text-secondary hover:text-white transition-colors" title="Collapse sidebar">
            <span className="material-symbols-outlined text-xl">keyboard_double_arrow_left</span>
          </button>
        )}
      </div>

      {collapsed && (
        <div className="p-3 flex justify-center border-b border-gh-border border-t-0">
          <button onClick={() => setCollapsed(false)} className="text-gh-text-secondary hover:text-white transition-colors" title="Expand sidebar">
            <span className="material-symbols-outlined text-xl">keyboard_double_arrow_right</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-2 flex flex-col">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === "/dashboard" ? "bg-surface-variant text-white" : "text-gh-text-secondary hover:bg-surface-variant hover:text-white"} ${collapsed ? "justify-center" : ""}`}
            title="Repositories"
          >
            <span className="material-symbols-outlined text-lg">folder</span>
            {!collapsed && <span>Repositories</span>}
          </Link>
          <Link
            href="/dashboard/history"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === "/dashboard/history" ? "bg-surface-variant text-white" : "text-gh-text-secondary hover:bg-surface-variant hover:text-white"} ${collapsed ? "justify-center" : ""}`}
            title="History"
          >
            <span className="material-symbols-outlined text-lg">history</span>
            {!collapsed && <span>History</span>}
          </Link>
        </nav>
      </div>

      <div className={`p-4 border-t border-gh-border flex ${collapsed ? "justify-center" : "items-center"}`}>
        <CustomUserButton showName={!collapsed} />
      </div>
    </aside>
  );
}
