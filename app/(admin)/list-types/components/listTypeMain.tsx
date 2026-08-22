"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import listTypeAPI, { type ListTypeItem } from "@/app/services/listType/listTypeAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import ListTypeFilter from "./listTypeFilter";
import ListTypeTable from "./listTypeTable";

type ListTypeListApiResult =
  | {
      success?: boolean;
      data?: ListTypeItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function ListTypeMain() {
  const { withLoading } = useLoading();
  const [listTypes, setListTypes] = useState<ListTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchListTypes = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        (await listTypeAPI.getListTypeAll()) as ListTypeListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "ไม่สามารถดึงข้อมูลประเภทรายการได้";
        await popup.error("เกิดข้อผิดพลาด", message);
        setListTypes([]);
        return;
      }

      setListTypes(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลประเภทรายการได้");
      setListTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchListTypes();
  }, [fetchListTypes]);

  const filteredListTypes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return listTypes;

    return listTypes.filter((item) => {
      const code = String(item.code || "").toLowerCase();
      const name = String(item.name || "").toLowerCase();
      const size = String(item.size || "").toLowerCase();
      return (
        code.includes(keyword) ||
        name.includes(keyword) ||
        size.includes(keyword)
      );
    });
  }, [listTypes, search]);

  const handleClearFilter = () => {
    setSearch("");
  };

  const handleAddListType = () => {
    void popup.info(
      "เพิ่มประเภทรายการ",
      "ฟังก์ชันเพิ่มประเภทรายการจะพร้อมใช้งานเร็วๆ นี้"
    );
  };

  const handleEditListType = (listType: ListTypeItem) => {
    void popup.info(
      "แก้ไขประเภทรายการ",
      `ฟังก์ชันแก้ไข ${listType.name} จะพร้อมใช้งานเร็วๆ นี้`
    );
  };

  const handleDeleteListType = async (listType: ListTypeItem) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบประเภทรายการ?",
      text: `ต้องการลบ ${listType.name} (${listType.code}) ใช่หรือไม่`,
    });
    if (!confirmed) return;

    await withLoading(async () => {
      const result = (await listTypeAPI.softDeleteListType(listType.id)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "ลบไม่สำเร็จ",
          result?.errMessage || result?.message || "ไม่สามารถลบประเภทรายการได้"
        );
        return;
      }

      await popup.success("ลบสำเร็จ", "ลบประเภทรายการเรียบร้อยแล้ว");
      void fetchListTypes();
    }, "กำลังลบประเภทรายการ...");
  };

  return (
    <div className="space-y-5">
      <ListTypeFilter
        search={search}
        onSearchChange={setSearch}
        onClear={handleClearFilter}
        onAdd={handleAddListType}
      />

      <ListTypeTable
        listTypes={filteredListTypes}
        loading={loading}
        onEdit={handleEditListType}
        onDelete={handleDeleteListType}
      />
    </div>
  );
}
