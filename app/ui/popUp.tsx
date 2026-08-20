"use client";

import Swal, { type SweetAlertIcon } from "sweetalert2";

type AppPopupAnimationOptions = {
  title?: string;
  icon?: SweetAlertIcon;
  timer?: number;
};

export function showAppPopupAnimation({
  title = "สำเร็จ",
  icon = "success",
  timer = 1400,
}: AppPopupAnimationOptions = {}) {
  return Swal.fire({
    title,
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
    color: "#163a7f",
    iconColor: "#2553D8",
    backdrop: `
      rgba(15, 23, 42, 0.42)
      left top
      no-repeat
    `,
    customClass: {
      container: "app-swal-container",
      popup: "app-swal-popup",
      title: "app-swal-title",
      icon: "app-swal-icon",
    },
  });
}

export default showAppPopupAnimation;
