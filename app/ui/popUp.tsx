"use client";

import Swal, { type SweetAlertIcon, type SweetAlertResult } from "sweetalert2";

const BRAND = {
  text: "#163a7f",
  confirm: "#2553D8",
  cancelBg: "#e5e7eb",
  backdrop: `
    rgba(15, 23, 42, 0.42)
    left top
    no-repeat
  `,
} as const;

/** สี icon แยกตาม status */
const ICON_COLORS: Record<SweetAlertIcon, string> = {
  success: "#16a34a",
  error: "#dc2626",
  warning: "#d97706",
  info: "#2553D8",
  question: "#2553D8",
};

const BASE_CLASSES = {
  container: "app-swal-container",
  popup: "app-swal-popup",
  title: "app-swal-title",
  htmlContainer: "app-swal-html",
  icon: "app-swal-icon",
  actions: "app-swal-actions",
  confirmButton: "app-swal-confirm-btn",
  cancelButton: "app-swal-cancel-btn",
} as const;

type StatusPopupOptions = {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  timer?: number;
};

type ConfirmPopupOptions = {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  /** ใช้โทนอันตราย (เช่น ลบข้อมูล) */
  danger?: boolean;
};

function resolveIconColor(icon: SweetAlertIcon, danger?: boolean): string {
  if (danger) return ICON_COLORS.error;
  return ICON_COLORS[icon] ?? ICON_COLORS.info;
}

/** Status popup — ขนาด/รูปแบบ/หลอดด้านล่างแบบเดิม + สี icon ตาม status */
export function showStatusPopup({
  title = "สำเร็จ",
  text,
  icon = "success",
  timer = 1400,
}: StatusPopupOptions = {}): Promise<SweetAlertResult> {
  return Swal.fire({
    title,
    text: text || undefined,
    icon,
    showConfirmButton: false,
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    timer,
    timerProgressBar: false,
    width: "240px",
    padding: "1.1rem 1rem 1rem",
    background: "#ffffff",
    color: BRAND.text,
    iconColor: resolveIconColor(icon),
    backdrop: BRAND.backdrop,
    customClass: {
      container: BASE_CLASSES.container,
      popup: BASE_CLASSES.popup,
      title: BASE_CLASSES.title,
      htmlContainer: BASE_CLASSES.htmlContainer,
      icon: BASE_CLASSES.icon,
    },
  });
}

/** Confirm popup — รูปแบบเดียวกับของเดิม มีปุ่มยืนยัน/ยกเลิก */
export async function showConfirmPopup({
  title = "ยืนยันการทำรายการ?",
  text,
  icon = "question",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  confirmButtonColor,
  danger = false,
}: ConfirmPopupOptions = {}): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text: text || undefined,
    icon,
    showConfirmButton: true,
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    allowOutsideClick: false,
    allowEscapeKey: true,
    width: "240px",
    padding: "1.1rem 1rem 1rem",
    background: "#ffffff",
    color: BRAND.text,
    iconColor: resolveIconColor(icon, danger),
    confirmButtonColor:
      confirmButtonColor ?? (danger ? ICON_COLORS.error : BRAND.confirm),
    cancelButtonColor: BRAND.cancelBg,
    backdrop: BRAND.backdrop,
    customClass: {
      container: BASE_CLASSES.container,
      popup: BASE_CLASSES.popup,
      title: BASE_CLASSES.title,
      htmlContainer: BASE_CLASSES.htmlContainer,
      icon: BASE_CLASSES.icon,
      actions: BASE_CLASSES.actions,
      confirmButton: BASE_CLASSES.confirmButton,
      cancelButton: BASE_CLASSES.cancelButton,
    },
  });

  return result.isConfirmed;
}

/** ทางลัดที่ใช้บ่อย */
export const popup = {
  success: (title = "สำเร็จ", text?: string) =>
    showStatusPopup({ title, text, icon: "success" }),
  error: (title = "เกิดข้อผิดพลาด", text?: string) =>
    showStatusPopup({ title, text, icon: "error", timer: 2200 }),
  warning: (title = "คำเตือน", text?: string) =>
    showStatusPopup({ title, text, icon: "warning", timer: 2000 }),
  info: (title = "แจ้งเตือน", text?: string) =>
    showStatusPopup({ title, text, icon: "info" }),
  confirm: (options?: ConfirmPopupOptions) => showConfirmPopup(options),
  confirmDelete: (options?: Omit<ConfirmPopupOptions, "danger" | "icon">) =>
    showConfirmPopup({
      title: "ยืนยันการลบ?",
      text: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้",
      icon: "warning",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
      danger: true,
      ...options,
    }),
};

/** @deprecated ใช้ showStatusPopup หรือ popup.success แทน */
export function showAppPopupAnimation(
  options: StatusPopupOptions = {}
): Promise<SweetAlertResult> {
  return showStatusPopup(options);
}

export default popup;
