"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import serviceTypeAPI, {
  type ServiceTypeItem,
} from "@/app/services/serviceType/serviceTypeAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import ServiceTypeFilter from "./serviceTypeFilter";
import ServiceTypeTable from "./serviceTypeTable";

type ServiceTypeListApiResult =
  | {
      success?: boolean;
      data?: ServiceTypeItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function ServiceTypeMain() {
  const { withLoading } = useLoading();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchServiceTypes = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        (await serviceTypeAPI.getServiceTypeAll()) as ServiceTypeListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "ไม่สามารถดึงข้อมูลประเภทบริการได้";
        await popup.error("เกิดข้อผิดพลาด", message);
        setServiceTypes([]);
        return;
      }

      setServiceTypes(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลประเภทบริการได้");
      setServiceTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchServiceTypes();
  }, [fetchServiceTypes]);

  const filteredServiceTypes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return serviceTypes;

    return serviceTypes.filter((item) => {
      const code = String(item.code || "").toLowerCase();
      const name = String(item.name || "").toLowerCase();
      return code.includes(keyword) || name.includes(keyword);
    });
  }, [search, serviceTypes]);

  const handleClearFilter = () => {
    setSearch("");
  };

  const handleAddServiceType = () => {
    void popup.info(
      "เพิ่มประเภทบริการ",
      "ฟังก์ชันเพิ่มประเภทบริการจะพร้อมใช้งานเร็วๆ นี้"
    );
  };

  const handleEditServiceType = (serviceType: ServiceTypeItem) => {
    void popup.info(
      "แก้ไขประเภทบริการ",
      `ฟังก์ชันแก้ไข ${serviceType.name} จะพร้อมใช้งานเร็วๆ นี้`
    );
  };

  const handleDeleteServiceType = async (serviceType: ServiceTypeItem) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบประเภทบริการ?",
      text: `ต้องการลบ ${serviceType.name} (${serviceType.code}) ใช่หรือไม่`,
    });
    if (!confirmed) return;

    await withLoading(async () => {
      const result = (await serviceTypeAPI.softDeleteServiceType(
        serviceType.id
      )) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "ลบไม่สำเร็จ",
          result?.errMessage || result?.message || "ไม่สามารถลบประเภทบริการได้"
        );
        return;
      }

      await popup.success("ลบสำเร็จ", "ลบประเภทบริการเรียบร้อยแล้ว");
      void fetchServiceTypes();
    }, "กำลังลบประเภทบริการ...");
  };

  return (
    <div className="space-y-5">
      <ServiceTypeFilter
        search={search}
        onSearchChange={setSearch}
        onClear={handleClearFilter}
        onAdd={handleAddServiceType}
      />

      <ServiceTypeTable
        serviceTypes={filteredServiceTypes}
        loading={loading}
        onEdit={handleEditServiceType}
        onDelete={handleDeleteServiceType}
      />
    </div>
  );
}
