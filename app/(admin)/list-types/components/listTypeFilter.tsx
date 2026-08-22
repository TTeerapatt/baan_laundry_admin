"use client";

import { FiPlus, FiSearch, FiXCircle } from "react-icons/fi";
import FilterPanel, {
  FilterField,
  filterInputClass,
} from "@/app/ui/filterPanel";

type ListTypeFilterProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onAdd?: () => void;
};

export default function ListTypeFilter({
  search,
  onSearchChange,
  onClear,
  onAdd,
}: ListTypeFilterProps) {
  return (
    <FilterPanel>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <FilterField
            label="ค้นหา"
            htmlFor="list-type-search"
            className="w-full sm:w-[280px]"
          >
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a849c]" />
              <input
                id="list-type-search"
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหาจากรหัส ชื่อ หรือ ขนาด"
                className={`${filterInputClass} pl-10`}
              />
            </div>
          </FilterField>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b8c9ff] bg-[#f8faff] px-4 text-[13px] font-semibold text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-[0.98]"
          >
            <FiXCircle className="h-4 w-4" />
            ล้างตัวกรอง
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2553D8] px-5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(37,83,216,0.28)] transition hover:bg-[#1d44b5] hover:shadow-[0_6px_18px_rgba(37,83,216,0.36)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#2553d8]/40"
        >
          <FiPlus className="h-4 w-4" />
          เพิ่มประเภทรายการ
        </button>
      </div>
    </FilterPanel>
  );
}
