"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { type ServiceTypeItem } from "@/app/services/serviceType/serviceTypeAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type ServiceTypeTableProps = {
  serviceTypes: ServiceTypeItem[];
  loading?: boolean;
  onEdit?: (serviceType: ServiceTypeItem) => void;
  onDelete?: (serviceType: ServiceTypeItem) => void;
};

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function ServiceTypeRowActions({
  serviceType,
  onEdit,
  onDelete,
}: {
  serviceType: ServiceTypeItem;
  onEdit?: (serviceType: ServiceTypeItem) => void;
  onDelete?: (serviceType: ServiceTypeItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(serviceType)}
        aria-label={`แก้ไข ${serviceType.name}`}
        title="แก้ไข"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(serviceType)}
        aria-label={`ลบ ${serviceType.name}`}
        title="ลบ"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ServiceTypeTable({
  serviceTypes,
  loading = false,
  onEdit,
  onDelete,
}: ServiceTypeTableProps) {
  const columns = useMemo<TableColumn<ServiceTypeItem>[]>(
    () => [
      {
        key: "id",
        title: "ID",
        cellClassName: "font-medium text-[#5b657d]",
        render: (serviceType) => serviceType.id,
      },
      {
        key: "code",
        title: "รหัส",
        render: (serviceType) => (
          <span className="inline-flex rounded-full bg-[#eef3ff] px-3 py-1 text-[12px] font-semibold text-[#2553D8] ring-1 ring-[#c7d7ff]">
            {serviceType.code}
          </span>
        ),
      },
      {
        key: "name",
        title: "ชื่อ",
        render: (serviceType) => (
          <span className="font-semibold text-[#1f2640]">{serviceType.name}</span>
        ),
      },
      {
        key: "created_at",
        title: "วันที่สร้าง",
        render: (serviceType) => formatDateTime(serviceType.created_at),
      },
      {
        key: "updated_at",
        title: "แก้ไขล่าสุด",
        render: (serviceType) => formatDateTime(serviceType.updated_at),
      },
      {
        key: "actions",
        title: "การใช้งาน",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (serviceType) => (
          <ServiceTypeRowActions
            serviceType={serviceType}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onDelete, onEdit]
  );

  return (
    <DataTable
      columns={columns}
      data={serviceTypes}
      loading={loading}
      getRowKey={(serviceType) => serviceType.id}
      emptyText="ไม่พบข้อมูลประเภทบริการ"
      loadingText="กำลังโหลดข้อมูลประเภทบริการ..."
    />
  );
}
