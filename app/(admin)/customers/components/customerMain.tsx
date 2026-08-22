"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import userAPI, { type UserItem } from "@/app/services/user/userAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import CustomerFilter from "./customerFilter";
import CustomerTable from "./customerTable";

type CustomerListApiResult =
  | {
      success?: boolean;
      data?: UserItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function CustomerMain() {
  const { withLoading } = useLoading();
  const [customers, setCustomers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await userAPI.getUserAll()) as CustomerListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "ไม่สามารถดึงข้อมูลลูกค้าได้";
        await popup.error("เกิดข้อผิดพลาด", message);
        setCustomers([]);
        return;
      }

      setCustomers(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลลูกค้าได้");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return customers;

    return customers.filter((customer) => {
      const phone = String(customer.phone || "").toLowerCase();
      const name = String(customer.name || "").toLowerCase();
      const note = String(customer.note || "").toLowerCase();
      return (
        phone.includes(keyword) ||
        name.includes(keyword) ||
        note.includes(keyword)
      );
    });
  }, [customers, search]);

  const handleClearFilter = () => {
    setSearch("");
  };

  const handleAddCustomer = () => {
    void popup.info("เพิ่มลูกค้า", "ฟังก์ชันเพิ่มลูกค้าจะพร้อมใช้งานเร็วๆ นี้");
  };

  const handleEditCustomer = (customer: UserItem) => {
    void popup.info(
      "แก้ไขลูกค้า",
      `ฟังก์ชันแก้ไข ${customer.name} จะพร้อมใช้งานเร็วๆ นี้`
    );
  };

  const handleDeleteCustomer = async (customer: UserItem) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบลูกค้า?",
      text: `ต้องการลบ ${customer.name} (${customer.phone}) ใช่หรือไม่`,
    });
    if (!confirmed) return;

    await withLoading(async () => {
      const result = (await userAPI.softDeleteUser(customer.id)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "ลบไม่สำเร็จ",
          result?.errMessage || result?.message || "ไม่สามารถลบลูกค้าได้"
        );
        return;
      }

      await popup.success("ลบสำเร็จ", "ลบลูกค้าเรียบร้อยแล้ว");
      void fetchCustomers();
    }, "กำลังลบลูกค้า...");
  };

  return (
    <div className="space-y-5">
      <CustomerFilter
        search={search}
        onSearchChange={setSearch}
        onClear={handleClearFilter}
        onAdd={handleAddCustomer}
      />

      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
}
