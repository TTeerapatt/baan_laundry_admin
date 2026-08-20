import type { IconType } from "react-icons";
import {
  MdDashboard,
  MdLocalLaundryService,
  MdPeople,
  MdPriceChange,
  MdReceiptLong,
  MdAdminPanelSettings,
} from "react-icons/md";

export type NavItem = {
  href: string;
  label: string;
  icon: IconType;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "แดชบอร์ด", icon: MdDashboard },
  { href: "/orders", label: "ออเดอร์", icon: MdReceiptLong },
  { href: "/customers", label: "ลูกค้า", icon: MdPeople },
  { href: "/service-types", label: "ประเภทบริการ", icon: MdLocalLaundryService },
  { href: "/list-prices", label: "ราคา", icon: MdPriceChange },
  { href: "/admins", label: "ผู้ดูแลระบบ", icon: MdAdminPanelSettings },
];

export function getNavLabelByPath(pathname: string): string {
  const exact = NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const nested = NAV_ITEMS.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
  return nested?.label ?? "แดชบอร์ด";
}
