"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, { type TableColumn } from "@/app/ui/table";

export type ListPriceRow = {
  id: number;
  service_type_id: number;
  list_type_id: number;
  unit_price: string;
  created_at: string;
  updated_at: string;
  serviceTypeName: string;
  listTypeName: string;
};

type ListPriceTableProps = {
  listPrices: ListPriceRow[];
  loading?: boolean;
  onEdit?: (listPrice: ListPriceRow) => void;
  onDelete?: (listPrice: ListPriceRow) => void;
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

function formatPrice(value: string | number): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function ListPriceRowActions({
  listPrice,
  onEdit,
  onDelete,
}: {
  listPrice: ListPriceRow;
  onEdit?: (listPrice: ListPriceRow) => void;
  onDelete?: (listPrice: ListPriceRow) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(listPrice)}
        aria-label={`แก้ไขราคา ${listPrice.id}`}
        title="แก้ไข"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(listPrice)}
        aria-label={`ลบราคา ${listPrice.id}`}
        title="ลบ"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ListPriceTable({
  listPrices,
  loading = false,
  onEdit,
  onDelete,
}: ListPriceTableProps) {
  const columns = useMemo<TableColumn<ListPriceRow>[]>(
    () => [
      {
        key: "index",
        title: "ลำดับ",
        cellClassName: "font-medium text-[#5b657d]",
        render: (_listPrice, index) => index + 1,
      },
      {
        key: "listTypeName",
        title: "รายการ",
        render: (listPrice) => listPrice.listTypeName,
      },
      {
        key: "serviceTypeName",
        title: "ประเภทบริการ",
        render: (listPrice) => (
          <span className="font-semibold text-[#1f2640]">
            {listPrice.serviceTypeName}
          </span>
        ),
      },
      {
        key: "unit_price",
        title: "ราคา/หน่วย",
        render: (listPrice) => (
          <span className="inline-flex rounded-full bg-[#eef3ff] px-3 py-1 text-[12px] font-semibold text-[#2553D8] ring-1 ring-[#c7d7ff]">
            {formatPrice(listPrice.unit_price)}
          </span>
        ),
      },
      {
        key: "created_at",
        title: "วันที่สร้าง",
        render: (listPrice) => formatDateTime(listPrice.created_at),
      },
      // {
      //   key: "updated_at",
      //   title: "แก้ไขล่าสุด",
      //   render: (listPrice) => formatDateTime(listPrice.updated_at),
      // },
      {
        key: "actions",
        title: "การใช้งาน",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (listPrice) => (
          <ListPriceRowActions
            listPrice={listPrice}
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
      data={listPrices}
      loading={loading}
      getRowKey={(listPrice) => listPrice.id}
      emptyText="ไม่พบข้อมูลราคา"
      loadingText="กำลังโหลดข้อมูลราคา..."
    />
  );
}
