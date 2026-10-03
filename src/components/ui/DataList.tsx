"use client";

/**
 * SUTRA STUDIO — Responsive Data List
 *
 * Renders one column definition and produces:
 *   • a real <table> on tablet and larger
 *   • stacked cards on phones
 *
 * This is what stops every admin/client table from forcing the user to scroll
 * sideways or cut text off at 360px.
 */

import React from "react";
import { ChevronRight } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  /** Cell content. Receives the row. */
  render: (row: T, index: number) => React.ReactNode;
  /** Hide on tablet, show from `lg`. */
  secondary?: boolean;
  /** Never render on phone (kept in the expanded card body only). */
  desktopOnly?: boolean;
  /** Tailwind-ish width hint for the table cell. */
  width?: string;
  align?: "left" | "right" | "center";
}

export interface DataListProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => string;
  caption: string;
  /** Rendered under each card on phones — the row's key detail. */
  cardPrimary?: (row: T) => React.ReactNode;
  cardSecondary?: (row: T) => React.ReactNode;
  /** Rendered as a trailing action row inside the phone card. */
  cardActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Accessible name for the phone list. */
  listLabel?: string;
  emptyState?: React.ReactNode;
}

export function DataList<T>({
  columns,
  rows,
  rowKey,
  caption,
  cardPrimary,
  cardSecondary,
  cardActions,
  onRowClick,
  listLabel,
  emptyState,
}: DataListProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* ---------- Phone: stacked cards ---------- */}
      <ul className="md:hidden space-y-2.5" aria-label={listLabel ?? caption}>
        {rows.map((row, i) => (
          <li key={rowKey(row, i)}>
            <div
              className={`rounded-2xl border border-[#EADFCB] bg-[#FFFDF9] overflow-hidden ${
                onRowClick ? "active:bg-[#F8F5EF]" : ""
              }`}
            >
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="w-full text-left px-4 py-3.5 flex items-start gap-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4A35A]"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    {cardPrimary ? (
                      cardPrimary(row)
                    ) : (
                      <div className="text-sm font-semibold text-[#0F172A] break-anywhere">
                        {String(columns[0]?.render(row, i) ?? "")}
                      </div>
                    )}
                    {cardSecondary && <div className="text-xs text-[#64748B] break-anywhere">{cardSecondary(row)}</div>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0 mt-0.5" aria-hidden="true" />
                </button>
              ) : (
                <div className="px-4 py-3.5 space-y-1.5">
                  {cardPrimary ? (
                    cardPrimary(row)
                  ) : (
                    <div className="text-sm font-semibold text-[#0F172A] break-anywhere">
                      {String(columns[0]?.render(row, i) ?? "")}
                    </div>
                  )}
                  {cardSecondary && <div className="text-xs text-[#64748B]">{cardSecondary(row)}</div>}
                </div>
              )}

              {cardActions && (
                <div className="px-4 pb-3.5 pt-1 border-t border-[#EADFCB]/60 flex flex-wrap gap-2">
                  {cardActions(row)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* ---------- Tablet and up: real table ---------- */}
      <div className="hidden md:block table-scroll-x rounded-2xl border border-[#EADFCB] bg-[#FFFDF9]">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-[#F8F5EF]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={`text-left font-semibold text-[11px] uppercase tracking-wider text-[#64748B] px-4 py-3 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                  } ${col.desktopOnly ? "hidden lg:table-cell" : ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-t border-[#EADFCB]/70 ${
                  onRowClick ? "cursor-pointer hover:bg-[#FDF9F0]" : "hover:bg-[#FDF9F0]"
                } focus-within:bg-[#FDF9F0]`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-middle text-[#0F172A] ${
                      col.secondary ? "hidden lg:table-cell" : ""
                    } ${col.desktopOnly ? "hidden lg:table-cell" : ""} ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                    }`}
                  >
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}