"use client";

import SideBar from "@/app/components/layout/sideBar";
import Header from "@/app/components/layout/header";
import AuthGuard from "@/app/hooks/AuthGuard";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth>
      <div className="flex min-h-screen bg-[#f4f6fb]">
        <SideBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
