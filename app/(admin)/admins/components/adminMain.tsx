"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import adminAPI, { type AdminItem } from "@/app/services/admin/adminAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import AdminCreateModal from "./adminCreateModal";
import AdminFilter from "./adminFilter";
import AdminTable from "./adminTable";

type AdminListApiResult =
  | {
      success?: boolean;
      data?: AdminItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function AdminMain() {
  const { withLoading } = useLoading();
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await adminAPI.getAdminAll()) as AdminListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "ไม่สามารถดึงข้อมูลผู้ดูแลระบบได้";
        await popup.error("เกิดข้อผิดพลาด", message);
        setAdmins([]);
        return;
      }

      setAdmins(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลผู้ดูแลระบบได้");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
  }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const roleFilter = role.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesRole =
        !roleFilter ||
        String(admin.role || "").trim().toLowerCase() === roleFilter;

      if (!keyword) {
        return matchesRole;
      }

      const displayName = String(admin.display_name || "").toLowerCase();
      const email = String(admin.email || "").toLowerCase();
      const matchesSearch =
        displayName.includes(keyword) || email.includes(keyword);

      return matchesRole && matchesSearch;
    });
  }, [admins, role, search]);

  const handleClearFilter = () => {
    setSearch("");
    setRole("");
  };

  const handleEditAdmin = (admin: AdminItem) => {
    void popup.info(
      "แก้ไขผู้ดูแลระบบ",
      `ฟังก์ชันแก้ไข ${admin.display_name} จะพร้อมใช้งานเร็วๆ นี้`
    );
  };

  const handleDeleteAdmin = async (admin: AdminItem) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบผู้ดูแลระบบ?",
      text: `ต้องการลบ ${admin.display_name} (${admin.email}) ใช่หรือไม่`,
    });
    if (!confirmed) return;

    await withLoading(async () => {
      const result = (await adminAPI.softDeleteAdmin(admin.id)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "ลบไม่สำเร็จ",
          result?.errMessage || result?.message || "ไม่สามารถลบผู้ดูแลระบบได้"
        );
        return;
      }

      await popup.success("ลบสำเร็จ", "ลบผู้ดูแลระบบเรียบร้อยแล้ว");
      void fetchAdmins();
    }, "กำลังลบผู้ดูแลระบบ...");
  };

  return (
    <div className="space-y-5">
      <AdminFilter
        search={search}
        role={role}
        onSearchChange={setSearch}
        onRoleChange={setRole}
        onClear={handleClearFilter}
        onAdd={() => setCreateOpen(true)}
      />

      <AdminTable
        admins={filteredAdmins}
        loading={loading}
        onEdit={handleEditAdmin}
        onDelete={handleDeleteAdmin}
      />

      <AdminCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          void fetchAdmins();
        }}
      />
    </div>
  );
}
