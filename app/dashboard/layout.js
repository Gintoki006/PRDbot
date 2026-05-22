import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import CustomUserButton from "../_components/auth/CustomUserButton";
import Link from "next/link";
import Image from "next/image";
import DashboardClientLayout from "./client-layout";

export default async function DashboardLayout({ children }) {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gh-bg overflow-hidden text-gh-text-main">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gh-border bg-gh-header">
        <div className="p-4 flex items-center gap-2 border-b border-gh-border h-16">
          <span className="material-symbols-outlined text-white text-2xl">terminal</span>
          <span className="text-white font-bold tracking-tight text-lg">PRDbot</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-surface-variant text-white"
            >
              <span className="material-symbols-outlined text-lg">folder</span>
              Repositories
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gh-text-secondary hover:bg-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              History
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gh-border flex items-center">
          <CustomUserButton showName={true} />
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-gh-header border-b border-gh-border flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-2xl">terminal</span>
          <span className="text-white font-bold tracking-tight text-lg">PRDbot</span>
        </div>
        <div className="flex items-center gap-4">
          <CustomUserButton />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden mt-16 md:mt-0 relative">
        <div className="flex-1 overflow-y-auto bg-gh-bg">
          <DashboardClientLayout>{children}</DashboardClientLayout>
        </div>
      </main>
    </div>
  );
}
