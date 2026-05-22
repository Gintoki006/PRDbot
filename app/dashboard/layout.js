import { currentUser } from "@clerk/nextjs/server";
import CustomUserButton from "../_components/auth/CustomUserButton";
import Link from "next/link";
import DashboardClientLayout from "./client-layout";
import DashboardSidebar from "./_components/DashboardSidebar";

export default async function DashboardLayout({ children }) {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gh-bg overflow-hidden text-gh-text-main">
      <DashboardSidebar />

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-gh-header border-b border-gh-border flex items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-white text-2xl">terminal</span>
          <span className="text-white font-bold tracking-tight text-lg">PRDbot</span>
        </Link>
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
