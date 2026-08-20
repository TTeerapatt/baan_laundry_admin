"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdLocalLaundryService } from "react-icons/md";
import adminAPI from "@/app/services/admin/adminAPI";
import { popup } from "@/app/ui/popUp";

type LoginApiResult =
  | {
      success?: boolean;
      data?: {
        token?: string;
        admin?: {
          id: number;
          email: string;
          display_name: string;
          role: string;
        };
      };
      status?: string;
      errMessage?: string;
    }
  | null
  | undefined;

function getErrorMessage(result: LoginApiResult, fallback: string): string {
  if (!result) return fallback;
  if (typeof result.errMessage === "string" && result.errMessage.trim()) {
    return result.errMessage;
  }
  return fallback;
}

export default function LoginMain() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      await popup.warning(
        "ข้อมูลไม่ครบถ้วน",
        "กรุณากรอกอีเมล และรหัสผ่าน"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = (await adminAPI.loginAdmin(
        trimmedEmail,
        password
      )) as LoginApiResult;

      if (!result || result.status === "failed" || !result.success) {
        await popup.error(
          "เข้าสู่ระบบไม่สำเร็จ",
          getErrorMessage(
            result,
            "การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล"
          )
        );
        return;
      }

      const token = result.data?.token;
      const admin = result.data?.admin;
      if (!token) {
        await popup.error(
          "เข้าสู่ระบบไม่สำเร็จ",
          "ไม่พบ token จากเซิร์ฟเวอร์"
        );
        return;
      }

      localStorage.setItem("token", token);
      if (admin) {
        localStorage.setItem("admin", JSON.stringify(admin));
      }

      await popup.success(
        "เข้าสู่ระบบสำเร็จ",
        "ยินดีต้อนรับเข้าสู่ระบบผู้ดูแลระบบ"
      );
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ"
          : "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ";

      await popup.error("เข้าสู่ระบบไม่สำเร็จ", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "linear-gradient(180deg, #6B8CFF 0%, #2553D8 100%)",
      }}
    >
      <div className="flex min-h-[700px] w-full max-w-[980px] overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(31,41,87,0.18)]">
        {/* Left brand panel */}
        <div
          className="relative hidden w-[40%] flex-col items-center justify-between px-8 pb-10 pt-12 md:flex"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #4C7DFF 0%, #2553D8 100%)",
          }}
        >
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
              <MdLocalLaundryService className="h-16 w-16 text-white" />
            </div>
            <p className="text-center text-[22px] font-bold tracking-wide">
              Baan Laundry
            </p>
            <p className="text-center text-[14px] font-medium text-white/85">
              ระบบจัดการร้านซักรีด
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white/10 px-5 py-6 text-center text-white/90 backdrop-blur-sm">
            <p className="text-[15px] font-semibold">Admin Panel</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/80">
              จัดการออเดอร์ ลูกค้า และสถานะงานซักรีดได้ในที่เดียว
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 md:w-[60%] md:px-16 md:py-14">
          <div className="mb-6 flex justify-center md:hidden">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-[#2553D8]/10">
              <MdLocalLaundryService className="h-12 w-12 text-[#2553D8]" />
            </div>
          </div>

          <h1 className="text-center text-[30px] font-bold leading-tight text-[#2553D8] sm:text-[34px]">
            เข้าสู่ระบบจัดการ
          </h1>

          <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[14px] font-semibold text-[#1f2640]"
              >
                อีเมล
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baanlaundry.com"
                className="h-12 w-full rounded-xl border border-[#d7dce7] bg-white px-4 text-[14px] text-[#1f2640] placeholder-[#adb2ba] outline-none transition focus:border-[#2553d8] focus:ring-2 focus:ring-[#2553d8]/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[14px] font-semibold text-[#1f2640]"
              >
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-[#d7dce7] bg-white px-4 pr-11 text-[14px] text-[#1f2640] placeholder-[#adb2ba] outline-none transition focus:border-[#2553d8] focus:ring-2 focus:ring-[#2553d8]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#757d94] hover:text-[#1f2640]"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <FiEye className="h-5 w-5" />
                  ) : (
                    <FiEyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    popup.info(
                      "ลืมรหัสผ่าน",
                      "กรุณาติดต่อเจ้าของร้านเพื่อรีเซ็ตรหัสผ่าน"
                    )
                  }
                  className="cursor-pointer text-[13px] font-medium text-[#2553D8] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#2553D8] text-[15px] font-semibold text-white transition hover:bg-[#1d44b5] focus:outline-none focus:ring-2 focus:ring-[#2553d8]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-white" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
