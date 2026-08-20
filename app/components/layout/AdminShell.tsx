"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/app/components/layout/sideBar";
import Header from "@/app/components/layout/header";
import { getAdminToken } from "@/app/lib/adminStorage";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-[#5b657d]">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <SideBar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
