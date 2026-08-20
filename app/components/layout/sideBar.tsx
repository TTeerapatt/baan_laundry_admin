"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdLocalLaundryService } from "react-icons/md";
import { NAV_ITEMS } from "@/app/lib/navItems";

export default function SideBar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col border-r border-[#e8ecf4] bg-white">
      <div className="flex h-[88px] items-center justify-center border-b border-[#eef1f7] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2553D8]/10">
            <MdLocalLaundryService className="h-7 w-7 text-[#2553D8]" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-[#1f2640]">Baan Laundry</p>
            <p className="text-[11px] font-medium text-[#7a849c]">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-[#4C7DFF] to-[#2553D8] text-white shadow-[0_8px_18px_rgba(37,83,216,0.28)]"
                  : "bg-[#f3f5f9] text-[#2b3348] hover:bg-[#e9edf5]"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? "text-white" : "text-[#5b657d]"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
