"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { MdAdminPanelSettings, MdManageAccounts, MdBadge } from "react-icons/md";
import adminAPI, {
  type AdminPermissionInput,
  type CreateAdminPayload,
} from "@/app/services/admin/adminAPI";
import menuAPI, {
  type MenuAllResponse,
  type MenuLabel,
  type MenuTab,
} from "@/app/services/menu/menuAPI";
import PasswordPolicyChecklist from "@/app/components/PasswordPolicyChecklist";
import { evaluatePasswordPolicy } from "@/app/lib/passwordPolicy";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";

type AdminCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type AdminRole = "owner" | "admin" | "staff";

type PermissionMap = Record<string, Record<string, boolean>>;

const STEPS = [
  { id: 1, label: "เลือกบทบาท" },
  { id: 2, label: "ข้อมูลผู้ใช้งาน" },
  { id: 3, label: "ขอบเขตสิทธิ์" },
  { id: 4, label: "ยืนยันการสร้าง" },
] as const;

const ROLE_OPTIONS: Array<{
  value: AdminRole;
  title: string;
  subtitle: string;
  description: string;
  Icon: typeof MdAdminPanelSettings;
}> = [
  {
    value: "owner",
    title: "Owner",
    subtitle: "เจ้าของระบบ",
    description: "สิทธิ์เต็มทุกเมนู และข้ามการตรวจ permission",
    Icon: MdAdminPanelSettings,
  },
  {
    value: "admin",
    title: "Admin",
    subtitle: "ผู้ดูแลระบบ",
    description: "จัดการข้อมูลหลักของร้านได้ตามสิทธิ์ที่กำหนด",
    Icon: MdManageAccounts,
  },
  {
    value: "staff",
    title: "Staff",
    subtitle: "พนักงาน",
    description: "ใช้งานตามขอบเขตเมนูที่ได้รับอนุญาต",
    Icon: MdBadge,
  },
];

const ACTION_ORDER = ["view", "add", "edit", "delete", "export"] as const;

type FormField =
  | "display_name"
  | "email"
  | "password"
  | "confirmPassword";

function emptyForm() {
  return {
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
}

const inputBaseClass =
  "h-11 w-full rounded-xl border bg-white text-[14px] text-[#1f2640] outline-none transition";
const inputNormalClass =
  "border-[#d7dce7] focus:border-[#2553D8] focus:ring-2 focus:ring-[#2553d8]/15";
const inputErrorClass =
  "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

function getInputClass(hasError: boolean, extra = "") {
  return `${inputBaseClass} ${hasError ? inputErrorClass : inputNormalClass} ${extra}`.trim();
}

function buildDefaultPermissions(
  tabs: MenuTab[],
  role: AdminRole
): PermissionMap {
  const next: PermissionMap = {};
  for (const tab of tabs) {
    const actions = tab.actions ?? [];
    next[tab.code] = {};
    for (const action of actions) {
      if (role === "owner") {
        next[tab.code][action.code] = true;
      } else if (role === "admin") {
        next[tab.code][action.code] = ["view", "add", "edit", "delete"].includes(
          action.code
        );
      } else {
        next[tab.code][action.code] = action.code === "view";
      }
    }
  }
  return next;
}

function permissionsToPayload(map: PermissionMap): AdminPermissionInput[] {
  return Object.entries(map)
    .map(([tab_code, actions]) => ({
      tab_code,
      action_codes: Object.entries(actions)
        .filter(([, allowed]) => allowed)
        .map(([code]) => code),
    }))
    .filter((item) => item.action_codes.length > 0);
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-2 px-2">
      {STEPS.map((step, index) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.id} className="relative flex flex-1 flex-col items-center">
            {!isLast ? (
              <div
                className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4 h-[2px] ${
                  isDone || currentStep > step.id
                    ? "bg-[#2553D8]"
                    : "bg-[#d7dce7]"
                }`}
              />
            ) : null}
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold ${
                isDone || isActive
                  ? "bg-[#2553D8] text-white"
                  : "bg-[#e8ecf4] text-[#8b93a7]"
              }`}
            >
              {isDone ? <FiCheck className="h-4 w-4" /> : step.id}
            </div>
            <p
              className={`mt-2 text-center text-[12px] font-semibold ${
                isActive || isDone ? "text-[#2553D8]" : "text-[#8b93a7]"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminCreateModal({
  open,
  onClose,
  onCreated,
}: AdminCreateModalProps) {
  const { withLoading } = useLoading();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<AdminRole | "">("");
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [labels, setLabels] = useState<MenuLabel[]>([]);
  const [tabs, setTabs] = useState<MenuTab[]>([]);
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [menuLoading, setMenuLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormField, boolean>>
  >({});

  const resetState = useCallback(() => {
    setStep(1);
    setRole("");
    setForm(emptyForm());
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPermissions({});
    setFieldErrors({});
  }, []);

  const clearFieldError = (field: FormField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const markFieldError = (field: FormField) => {
    setFieldErrors({ [field]: true });
  };

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;
    const main = document.querySelector("main");

    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevMainOverflow =
      main instanceof HTMLElement ? main.style.overflow : "";

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (main instanceof HTMLElement) {
      main.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      if (main instanceof HTMLElement) {
        main.style.overflow = prevMainOverflow;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    resetState();

    let cancelled = false;
    const loadMenu = async () => {
      setMenuLoading(true);
      try {
        const result = (await menuAPI.getMenuAll()) as {
          success?: boolean;
          status?: string;
          data?: MenuAllResponse;
          errMessage?: string;
          message?: string;
        };

        if (cancelled) return;

        if (!result || result.status === "failed" || result.success === false) {
          await popup.error(
            "เกิดข้อผิดพลาด",
            result?.errMessage ||
              result?.message ||
              "ไม่สามารถดึงข้อมูลเมนูสิทธิ์ได้"
          );
          setLabels([]);
          setTabs([]);
          return;
        }

        const nextLabels = Array.isArray(result.data?.labels)
          ? result.data.labels.filter((item) => item.is_active)
          : [];
        const nextTabs = Array.isArray(result.data?.tabs)
          ? result.data.tabs.filter((item) => item.is_active)
          : [];
        setLabels(nextLabels);
        setTabs(nextTabs);
      } catch {
        if (!cancelled) {
          await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลเมนูสิทธิ์ได้");
          setLabels([]);
          setTabs([]);
        }
      } finally {
        if (!cancelled) setMenuLoading(false);
      }
    };

    void loadMenu();
    return () => {
      cancelled = true;
    };
  }, [open, resetState]);

  const groupedTabs = useMemo(() => {
    const sortedLabels = [...labels].sort(
      (a, b) => a.sort_order - b.sort_order || a.id - b.id
    );
    return sortedLabels
      .map((label) => ({
        label,
        tabs: tabs
          .filter((tab) => tab.menu_label_id === label.id)
          .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
      }))
      .filter((group) => group.tabs.length > 0);
  }, [labels, tabs]);

  const selectedRole = ROLE_OPTIONS.find((item) => item.value === role);

  const allActionColumns = useMemo(() => {
    const found = new Set<string>();
    for (const tab of tabs) {
      for (const action of tab.actions ?? []) {
        found.add(action.code);
      }
    }
    return ACTION_ORDER.filter((code) => found.has(code));
  }, [tabs]);

  const handleSelectRole = (nextRole: AdminRole) => {
    setRole(nextRole);
    setPermissions(buildDefaultPermissions(tabs, nextRole));
  };

  useEffect(() => {
    if (!role || tabs.length === 0) return;
    setPermissions((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return buildDefaultPermissions(tabs, role);
    });
  }, [role, tabs]);

  const togglePermission = (tabCode: string, actionCode: string) => {
    setPermissions((prev) => ({
      ...prev,
      [tabCode]: {
        ...(prev[tabCode] || {}),
        [actionCode]: !prev[tabCode]?.[actionCode],
      },
    }));
  };

  const validateStep2 = async () => {
    const displayName = form.display_name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!displayName) {
      markFieldError("display_name");
      await popup.warning("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อที่แสดง");
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markFieldError("email");
      await popup.warning("ข้อมูลไม่ถูกต้อง", "กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }
    if (!evaluatePasswordPolicy(password).requiredPassed) {
      markFieldError("password");
      await popup.warning(
        "รหัสผ่านไม่ผ่านเงื่อนไข",
        "กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด"
      );
      return false;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: true, password: true });
      await popup.warning("ข้อมูลไม่ถูกต้อง", "รหัสผ่านยืนยันไม่ตรงกัน");
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!role) {
        await popup.warning("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกบทบาทผู้ใช้งาน");
        return;
      }
      setFieldErrors({});
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!(await validateStep2())) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleConfirmCreate = async () => {
    if (!role) return;

    const confirmed = await popup.confirm({
      title: "ยืนยันการสร้างผู้ดูแลระบบ?",
      text: `ต้องการสร้างบัญชี ${form.display_name.trim()} (${form.email.trim()}) ในบทบาท ${role} ใช่หรือไม่`,
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    const payload: CreateAdminPayload = {
      email: form.email.trim(),
      password: form.password.trim(),
      display_name: form.display_name.trim(),
      role,
      permissions:
        role === "owner" ? undefined : permissionsToPayload(permissions),
    };

    let created = false;

    await withLoading(async () => {
      const result = (await adminAPI.createAdmin(payload)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "สร้างไม่สำเร็จ",
          result?.errMessage ||
            result?.message ||
            "ไม่สามารถสร้างผู้ดูแลระบบได้"
        );
        return;
      }

      created = true;
    }, "กำลังสร้างผู้ดูแลระบบ...");

    if (!created) return;

    handleClose();
    onCreated();
    await popup.success(
      "เพิ่มผู้ใช้งานสำเร็จแล้ว",
      "สร้างบัญชีผู้ดูแลระบบเรียบร้อยแล้ว"
    );
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequestClose = async () => {
    const confirmed = await popup.confirm({
      title: "ต้องการออกจากหน้านี้หรือไม่?",
      text: "ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden overscroll-none p-4">
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        className="absolute inset-0 bg-[#0f172a]/45"
        onClick={() => void handleRequestClose()}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[24px] border border-[#e8ecf4] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#eef2ff] px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1f2640]">
              เพิ่มผู้ดูแลระบบ
            </h2>
            {/* <p className="text-[13px] text-[#7a849c]">
              สร้างบัญชีผู้ใช้งานทีละขั้นตอน
            </p> */}
          </div>
          <button
            type="button"
            onClick={() => void handleRequestClose()}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#e8ecf4] text-[#5b657d] transition hover:bg-[#f8faff]"
            aria-label="ปิด"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Stepper currentStep={step} />

          {step === 1 ? (
            <div>
              <h3 className="text-[22px] font-bold text-[#1f2640]">
                เลือกบทบาทผู้ใช้งาน
              </h3>
              {/* <p className="mt-1 text-[14px] text-[#7a849c]">
                เลือกบทบาทที่ตรงกับหน้าที่การทำงาน เพื่อกำหนดสิทธิ์การใช้งานที่เหมาะสม
              </p> */}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {ROLE_OPTIONS.map((option) => {
                  const selected = role === option.value;
                  const Icon = option.Icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectRole(option.value)}
                      className={`relative cursor-pointer rounded-2xl border px-4 py-6 text-left transition ${
                        selected
                          ? "border-[#2553D8] bg-[#eef3ff] shadow-[0_8px_20px_rgba(37,83,216,0.12)]"
                          : "border-[#e8ecf4] bg-white hover:border-[#c7d7ff]"
                      }`}
                    >
                      {selected ? (
                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2553D8] text-white">
                          <FiCheck className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2553D8]/10 text-[#2553D8]">
                        <Icon className="h-7 w-7" />
                      </div>
                      <p className="text-center text-[16px] font-bold text-[#1f2640]">
                        {option.title}
                      </p>
                      <p className="mt-1 text-center text-[13px] font-medium text-[#2553D8]">
                        ({option.subtitle})
                      </p>
                      {/* <p className="mt-3 text-center text-[12px] leading-relaxed text-[#7a849c]">
                        {option.description}
                      </p> */}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h3 className="text-[22px] font-bold text-[#1f2640]">
                กรอกข้อมูลผู้ใช้งาน
              </h3>
              {/* <p className="mt-1 text-[14px] text-[#7a849c]">
                กรอกข้อมูลตามที่ระบบต้องการเพื่อสร้างบัญชีผู้ดูแลระบบ
              </p> */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
                    ชื่อที่แสดง
                  </span>
                  <div className="relative">
                    <FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b93a7]" />
                    <input
                      type="text"
                      value={form.display_name}
                      onChange={(e) => {
                        clearFieldError("display_name");
                        setForm((prev) => ({
                          ...prev,
                          display_name: e.target.value,
                        }));
                      }}
                      className={getInputClass(
                        Boolean(fieldErrors.display_name),
                        "pl-10 pr-4"
                      )}
                    />
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
                    อีเมล
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      clearFieldError("email");
                      setForm((prev) => ({ ...prev, email: e.target.value }));
                    }}
                    className={getInputClass(
                      Boolean(fieldErrors.email),
                      "px-4"
                    )}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
                    รหัสผ่าน
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => {
                        clearFieldError("password");
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                      }}
                      className={getInputClass(
                        Boolean(fieldErrors.password),
                        "px-4 pr-11"
                      )}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 z-10 flex cursor-pointer items-center pr-3.5 text-[#8b93a7] hover:text-[#1f2640]"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <FiEye className="h-4 w-4" />
                      ) : (
                        <FiEyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3">
                    <PasswordPolicyChecklist password={form.password} />
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
                    ยืนยันรหัสผ่าน
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => {
                        clearFieldError("confirmPassword");
                        setForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }));
                      }}
                      className={getInputClass(
                        Boolean(fieldErrors.confirmPassword),
                        "px-4 pr-11"
                      )}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 z-10 flex cursor-pointer items-center pr-3.5 text-[#8b93a7] hover:text-[#1f2640]"
                      aria-label={
                        showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                      }
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? (
                        <FiEye className="h-4 w-4" />
                      ) : (
                        <FiEyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-[22px] font-bold text-[#1f2640]">
                    กำหนดขอบเขตสิทธิ์
                  </h3>
                  {/* <p className="mt-1 text-[14px] text-[#7a849c]">
                    ติ๊กสิทธิ์ตามเมนูจากระบบ (ดึงจาก getMenuAll)
                    {role === "owner"
                      ? " — Owner มีสิทธิ์เต็มโดยอัตโนมัติ"
                      : ""}
                  </p> */}
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4ff] bg-[#f8faff] px-3 py-2 text-[13px] font-semibold text-[#2553D8]">
                  <FiShield className="h-4 w-4" />
                  {selectedRole?.title || "-"}
                </div>
              </div>

              {menuLoading ? (
                <p className="py-10 text-center text-[14px] text-[#7a849c]">
                  กำลังโหลดเมนูสิทธิ์...
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#e8ecf4]">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f8faff] text-left text-[12px] font-semibold text-[#5b657d]">
                        <th className="px-4 py-3">หมวดหมู่ / เมนูระบบ</th>
                        {allActionColumns.map((code) => (
                          <th
                            key={code}
                            className="px-3 py-3 text-center capitalize"
                          >
                            {code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedTabs.map((group) => (
                        <FragmentGroup
                          key={group.label.code}
                          labelName={group.label.name}
                          tabs={group.tabs}
                          actionColumns={allActionColumns}
                          permissions={permissions}
                          disabled={role === "owner"}
                          onToggle={togglePermission}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h3 className="text-[22px] font-bold text-[#1f2640]">
                ตรวจสอบและยืนยันการสร้าง
              </h3>
              {/* <p className="mt-1 text-[14px] text-[#7a849c]">
                ตรวจทานข้อมูลก่อนสร้างบัญชีผู้ดูแลระบบ
              </p> */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#7a849c]">
                    ชื่อบทบาท
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-[#1f2640]">
                    {selectedRole?.title} ({selectedRole?.subtitle})
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#7a849c]">
                    ชื่อที่แสดง
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-[#1f2640]">
                    {form.display_name.trim() || "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3 sm:col-span-2">
                  <p className="text-[12px] font-semibold text-[#7a849c]">
                    อีเมล
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-[#1f2640]">
                    {form.email.trim() || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-[15px] font-bold text-[#1f2640]">
                    สิทธิ์การเข้าถึงเมนู (สรุป)
                  </h4>
                  {/* <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="cursor-pointer text-[13px] font-semibold text-[#2553D8] hover:underline"
                  >
                    แก้ไข →
                  </button> */}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#e8ecf4]">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f8faff] text-left text-[12px] font-semibold text-[#5b657d]">
                        <th className="px-4 py-3">หมวดหมู่ / เมนูระบบ</th>
                        {allActionColumns.map((code) => (
                          <th
                            key={code}
                            className="px-3 py-3 text-center capitalize"
                          >
                            {code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedTabs.map((group) => (
                        <FragmentGroup
                          key={group.label.code}
                          labelName={group.label.name}
                          tabs={group.tabs}
                          actionColumns={allActionColumns}
                          permissions={permissions}
                          disabled
                          readOnly
                          onToggle={() => undefined}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#eef2ff] px-6 py-4">
            <button
              type="button"
              onClick={
                step === 1 ? () => void handleRequestClose() : handleBack
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-[#5b657d] transition hover:bg-[#f3f5f9]"
            >
              <FiArrowLeft className="h-4 w-4" />
              {step === 1 ? "ยกเลิก" : "ย้อนกลับ"}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => void handleNext()}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#2553D8] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d44b5]"
              >
                ถัดไป
                <FiArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleConfirmCreate()}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#16a34a] px-5 text-[14px] font-semibold text-white transition hover:bg-[#15803d]"
              >
                <FiCheck className="h-4 w-4" />
                ยืนยันการสร้าง
              </button>
            )}
          </div>
      </div>
    </div>
  );
}

function FragmentGroup({
  labelName,
  tabs,
  actionColumns,
  permissions,
  disabled,
  readOnly = false,
  onToggle,
}: {
  labelName: string;
  tabs: MenuTab[];
  actionColumns: readonly string[];
  permissions: PermissionMap;
  disabled?: boolean;
  readOnly?: boolean;
  onToggle: (tabCode: string, actionCode: string) => void;
}) {
  return (
    <>
      <tr className="bg-[#f3f5f9]">
        <td
          colSpan={1 + actionColumns.length}
          className="px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[#5b657d]"
        >
          {labelName}
        </td>
      </tr>
      {tabs.map((tab) => {
        const available = new Set((tab.actions ?? []).map((item) => item.code));
        return (
          <tr key={tab.code} className="border-t border-[#eef2ff]">
            <td className="px-4 py-3 text-[14px] font-medium text-[#1f2640]">
              {tab.name}
            </td>
            {actionColumns.map((actionCode) => {
              const supported = available.has(actionCode);
              const checked = Boolean(permissions[tab.code]?.[actionCode]);
              return (
                <td key={actionCode} className="px-3 py-3 text-center">
                  {supported ? (
                    readOnly ? (
                      checked ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#2553D8]/10 text-[#2553D8]">
                          <FiCheck className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-[#c5cad6]">—</span>
                      )
                    ) : (
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => onToggle(tab.code, actionCode)}
                        className="h-4 w-4 cursor-pointer accent-[#2553D8] disabled:cursor-not-allowed"
                      />
                    )
                  ) : (
                    <span className="text-[#c5cad6]">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
