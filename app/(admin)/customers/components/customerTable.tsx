"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { type UserItem } from "@/app/services/user/userAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type CustomerTableProps = {
  customers: UserItem[];
  loading?: boolean;
  onEdit?: (customer: UserItem) => void;
  onDelete?: (customer: UserItem) => void;
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

function CustomerRowActions({
  customer,
  onEdit,
  onDelete,
}: {
  customer: UserItem;
  onEdit?: (customer: UserItem) => void;
  onDelete?: (customer: UserItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(customer)}
        aria-label={`แก้ไข ${customer.name}`}
        title="แก้ไข"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(customer)}
        aria-label={`ลบ ${customer.name}`}
        title="ลบ"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CustomerTable({
  customers,
  loading = false,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  const columns = useMemo<TableColumn<UserItem>[]>(
    () => [
      {
        key: "index",
        title: "ลำดับ",
        cellClassName: "font-medium text-[#5b657d]",
        render: (_customer, index) => index + 1,
      },
      {
        key: "phone",
        title: "เบอร์โทร",
        render: (customer) => (
          <span className="font-semibold text-[#1f2640]">{customer.phone}</span>
        ),
      },
      {
        key: "name",
        title: "ชื่อ",
        render: (customer) => customer.name,
      },
      {
        key: "note",
        title: "หมายเหตุ",
        render: (customer) => customer.note || "-",
      },
      {
        key: "created_at",
        title: "วันที่สร้าง",
        render: (customer) => formatDateTime(customer.created_at),
      },
      {
        key: "updated_at",
        title: "แก้ไขล่าสุด",
        render: (customer) => formatDateTime(customer.updated_at),
      },
      {
        key: "actions",
        title: "การใช้งาน",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (customer) => (
          <CustomerRowActions
            customer={customer}
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
      data={customers}
      loading={loading}
      getRowKey={(customer) => customer.id}
      emptyText="ไม่พบข้อมูลลูกค้า"
      loadingText="กำลังโหลดข้อมูลลูกค้า..."
    />
  );
}
