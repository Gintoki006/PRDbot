"use client";

import { ToastProvider } from "./_components/Toast";

export default function DashboardClientLayout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
