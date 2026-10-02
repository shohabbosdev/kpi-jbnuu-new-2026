"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UniversalPaginationProps } from "@/types";

export const UniversalPagination: React.FC<UniversalPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  perPageOptions = [10, 20, 25, 50, 100, 500, 1000],
  itemLabel = "yozuv",
  theme
}) => {
  if (totalItems === 0) return null;

  const isDark = theme === "dark";
  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 1;
  const endItem = itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : totalItems;

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div
      className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
        }`}
    >
      {/* Chap tomon: Qaydlar soni va har sahifadagi miqdor */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="font-medium">
          Jami <b className={isDark ? "text-white" : "text-slate-900"}>{totalItems}</b> ta {itemLabel}dan{" "}
          <b className={isDark ? "text-blue-400" : "text-blue-700"}>{startItem}–{endItem}</b> koʻrsatilmoqda
        </span>
        {onItemsPerPageChange && itemsPerPage && (
          <>
            <span className={isDark ? "text-slate-700" : "text-slate-300"}>|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Har sahifada:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  onItemsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${isDark
                  ? "bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-600"
                  : "bg-white border-slate-300 text-slate-800 hover:border-slate-400 shadow-xs"
                  }`}
              >
                {perPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} tadan
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* O'ng tomon: Sahifalash tugmalari */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Oldingi tugmasi */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${currentPage <= 1
              ? isDark
                ? "bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
              : isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-xs cursor-pointer"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer"
              }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Oldingi</span>
          </button>

          {/* Sahifa raqamlari */}
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className={`w-8 h-8 flex items-center justify-center font-bold ${isDark ? "text-slate-600" : "text-slate-400"
                    }`}
                >
                  ...
                </span>
              );
            }
            const isCurr = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${isCurr
                  ? isDark
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400"
                    : "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                  : isDark
                    ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                  }`}
              >
                {p}
              </button>
            );
          })}

          {/* Keyingi tugmasi */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${currentPage >= totalPages
              ? isDark
                ? "bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50"
              : isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-xs cursor-pointer"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs cursor-pointer"
              }`}
          >
            <span className="hidden sm:inline">Keyingi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
