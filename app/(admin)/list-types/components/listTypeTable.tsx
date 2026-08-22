"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { type ListTypeItem } from "@/app/services/listType/listTypeAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type ListTypeTableProps = {
  listTypes: ListTypeItem[];
  loading?: boolean;
  onEdit?: (listType: ListTypeItem) => void;
  onDelete?: (listType: ListTypeItem) => void;
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

function ListTypeRowActions({
  listType,
  onEdit,
  onDelete,
}: {
  listType: ListTypeItem;
  onEdit?: (listType: ListTypeItem) => void;
  onDelete?: (listType: ListTypeItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(listType)}
        aria-label={`แก้ไข ${listType.name}`}
        title="แก้ไข"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(listType)}
        aria-label={`ลบ ${listType.name}`}
        title="ลบ"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ListTypeTable({
  listTypes,
  loading = false,
  onEdit,
  onDelete,
}: ListTypeTableProps) {
  const columns = useMemo<TableColumn<ListTypeItem>[]>(
    () => [
      {
        key: "id",
        title: "ID",
        cellClassName: "font-medium text-[#5b657d]",
        render: (listType) => listType.id,
      },
      {
        key: "code",
        title: "รหัส",
        render: (listType) => (
          <span className="inline-flex rounded-full bg-[#eef3ff] px-3 py-1 text-[12px] font-semibold text-[#2553D8] ring-1 ring-[#c7d7ff]">
            {listType.code}
          </span>
        ),
      },
      {
        key: "name",
        title: "ชื่อ",
        render: (listType) => (
          <span className="font-semibold text-[#1f2640]">{listType.name}</span>
        ),
      },
      {
        key: "size",
        title: "ขนาด",
        render: (listType) => listType.size,
      },
      {
        key: "created_at",
        title: "วันที่สร้าง",
        render: (listType) => formatDateTime(listType.created_at),
      },
      {
        key: "updated_at",
        title: "แก้ไขล่าสุด",
        render: (listType) => formatDateTime(listType.updated_at),
      },
      {
        key: "actions",
        title: "การใช้งาน",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (listType) => (
          <ListTypeRowActions
            listType={listType}
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
      data={listTypes}
      loading={loading}
      getRowKey={(listType) => listType.id}
      emptyText="ไม่พบข้อมูลประเภทรายการ"
      loadingText="กำลังโหลดข้อมูลประเภทรายการ..."
    />
  );
}
