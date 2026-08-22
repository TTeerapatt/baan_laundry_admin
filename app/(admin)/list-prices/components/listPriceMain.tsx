"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import listPriceAPI, {
  type ListPriceItem,
} from "@/app/services/listPrice/listPriceAPI";
import listTypeAPI, { type ListTypeItem } from "@/app/services/listType/listTypeAPI";
import serviceTypeAPI, {
  type ServiceTypeItem,
} from "@/app/services/serviceType/serviceTypeAPI";
import { popup } from "@/app/ui/popUp";
import ListPriceFilter from "./listPriceFilter";
import ListPriceTable, { type ListPriceRow } from "./listPriceTable";

type ApiListResult<T> =
  | {
      success?: boolean;
      data?: T[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

function isFailedResult(result: ApiListResult<unknown> | undefined): boolean {
  return !result || result.status === "failed" || result.success === false;
}

function getErrorMessage(
  result: ApiListResult<unknown> | undefined,
  fallback: string
): string {
  return result?.errMessage || result?.message || fallback;
}

export default function ListPriceMain() {
  const [listPrices, setListPrices] = useState<ListPriceItem[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>([]);
  const [listTypes, setListTypes] = useState<ListTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchListPrices = useCallback(async () => {
    setLoading(true);
    try {
      const [listPriceResult, serviceTypeResult, listTypeResult] =
        await Promise.all([
          listPriceAPI.getListPriceAll(),
          serviceTypeAPI.getServiceTypeAll(),
          listTypeAPI.getListTypeAll(),
        ]);

      const typedListPriceResult = listPriceResult as ApiListResult<ListPriceItem>;
      const typedServiceTypeResult =
        serviceTypeResult as ApiListResult<ServiceTypeItem>;
      const typedListTypeResult = listTypeResult as ApiListResult<ListTypeItem>;

      if (isFailedResult(typedListPriceResult)) {
        await popup.error(
          "เกิดข้อผิดพลาด",
          getErrorMessage(typedListPriceResult, "ไม่สามารถดึงข้อมูลราคาได้")
        );
        setListPrices([]);
        setServiceTypes([]);
        setListTypes([]);
        return;
      }

      setListPrices(
        Array.isArray(typedListPriceResult?.data) ? typedListPriceResult.data : []
      );
      setServiceTypes(
        Array.isArray(typedServiceTypeResult?.data)
          ? typedServiceTypeResult.data
          : []
      );
      setListTypes(
        Array.isArray(typedListTypeResult?.data) ? typedListTypeResult.data : []
      );
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลราคาได้");
      setListPrices([]);
      setServiceTypes([]);
      setListTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchListPrices();
  }, [fetchListPrices]);

  const listPriceRows = useMemo<ListPriceRow[]>(() => {
    const serviceTypeMap = new Map(
      serviceTypes.map((item) => [item.id, item.name] as const)
    );
    const listTypeMap = new Map(
      listTypes.map((item) => [item.id, item.name] as const)
    );

    return listPrices.map((item) => ({
      ...item,
      serviceTypeName:
        serviceTypeMap.get(item.service_type_id) ||
        `#${item.service_type_id}`,
      listTypeName:
        listTypeMap.get(item.list_type_id) || `#${item.list_type_id}`,
    }));
  }, [listPrices, listTypes, serviceTypes]);

  const filteredListPrices = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return listPriceRows;

    return listPriceRows.filter((item) => {
      const serviceTypeName = String(item.serviceTypeName || "").toLowerCase();
      const listTypeName = String(item.listTypeName || "").toLowerCase();
      const unitPrice = String(item.unit_price || "").toLowerCase();
      return (
        serviceTypeName.includes(keyword) ||
        listTypeName.includes(keyword) ||
        unitPrice.includes(keyword)
      );
    });
  }, [listPriceRows, search]);

  const handleClearFilter = () => {
    setSearch("");
  };

  const handleAddListPrice = () => {
    void popup.info("เพิ่มราคา", "ฟังก์ชันเพิ่มราคาจะพร้อมใช้งานเร็วๆ นี้");
  };

  const handleEditListPrice = (listPrice: ListPriceRow) => {
    void popup.info(
      "แก้ไขราคา",
      `ฟังก์ชันแก้ไข ${listPrice.serviceTypeName} / ${listPrice.listTypeName} จะพร้อมใช้งานเร็วๆ นี้`
    );
  };

  const handleDeleteListPrice = async (listPrice: ListPriceRow) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบราคา?",
      text: `ต้องการลบ ${listPrice.serviceTypeName} / ${listPrice.listTypeName} (${listPrice.unit_price} บาท) ใช่หรือไม่`,
    });
    if (!confirmed) return;

    const result = (await listPriceAPI.softDeleteListPrice(listPrice.id)) as {
      success?: boolean;
      status?: string;
      errMessage?: string;
      message?: string;
    };

    if (!result || result.status === "failed" || result.success === false) {
      await popup.error(
        "ลบไม่สำเร็จ",
        result?.errMessage || result?.message || "ไม่สามารถลบราคาได้"
      );
      return;
    }

    await popup.success("ลบสำเร็จ", "ลบราคาเรียบร้อยแล้ว");
    void fetchListPrices();
  };

  return (
    <div className="space-y-5">
      <ListPriceFilter
        search={search}
        onSearchChange={setSearch}
        onClear={handleClearFilter}
        onAdd={handleAddListPrice}
      />

      <ListPriceTable
        listPrices={filteredListPrices}
        loading={loading}
        onEdit={handleEditListPrice}
        onDelete={handleDeleteListPrice}
      />
    </div>
  );
}
