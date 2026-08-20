"use client";

import { popup, showConfirmPopup, showStatusPopup } from "../ui/popUp";

const btnClass =
  "rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 bg-[#2553D8]";

export default function PopupDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-[#163a7f]">Popup Demo</h1>
          <p className="text-sm text-slate-500">
            ตัวอย่างตามดีไซน์: โทนน้ำเงิน + ปุ่มตกลง
          </p>
        </header>

        <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#163a7f]">
            Status popup (ปุ่มตกลง)
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={btnClass}
              onClick={() =>
                showStatusPopup({
                  title: "ไม่สามารถลบผู้ใช้งานได้",
                  text: "คุณไม่สามารถลบบัญชีของตัวเองได้",
                  icon: "warning",
                })
              }
            >
              ตัวอย่างตามรูป
            </button>
            <button
              type="button"
              className={btnClass}
              onClick={() => popup.success("บันทึกสำเร็จ", "ข้อมูลถูกบันทึกแล้ว")}
            >
              success
            </button>
            <button
              type="button"
              className={btnClass}
              onClick={() =>
                popup.error("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกได้")
              }
            >
              error
            </button>
            <button
              type="button"
              className={btnClass}
              onClick={() => popup.info("แจ้งเตือน", "ระบบอัปเดตเรียบร้อย")}
            >
              info
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#163a7f]">
            Confirm popup (ยกเลิก / ตกลง)
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={btnClass}
              onClick={async () => {
                const ok = await popup.logout();
                if (ok) await popup.success("ออกจากระบบแล้ว");
              }}
            >
              ตัวอย่างออกจากระบบ
            </button>
            <button
              type="button"
              className={btnClass}
              onClick={async () => {
                const ok = await showConfirmPopup({
                  title: "ยืนยันเปลี่ยนสถานะ?",
                  text: "ออเดอร์จะถูกตั้งเป็น processing",
                  confirmText: "ตกลง",
                  cancelText: "ยกเลิก",
                });
                if (ok) await popup.success("ยืนยันแล้ว");
              }}
            >
              confirm
            </button>
            <button
              type="button"
              className={btnClass}
              onClick={async () => {
                const ok = await popup.confirmDelete({
                  text: "ลบออเดอร์ใบนี้หรือไม่?",
                });
                if (ok) await popup.success("ลบสำเร็จ");
              }}
            >
              confirmDelete
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
