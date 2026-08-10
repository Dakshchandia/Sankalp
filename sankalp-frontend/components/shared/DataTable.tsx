"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowKey: (row: T) => string;
  onSort?: (key: string, direction: "asc" | "desc") => void;
}

/**
 * Reusable professional data table with sorting support.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription,
  getRowKey,
  onSort,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  if (isLoading) return <TableSkeleton rows={5} />;

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(col.className)}
                onClick={() => col.sortable && handleSort(String(col.key))}
                style={col.sortable ? { cursor: "pointer", userSelect: "none" } : {}}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className="text-slate-300">
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-primary-600" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-primary-600" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  className="border-0 bg-transparent"
                />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((col) => {
                  const value = (row as Record<string, unknown>)[String(col.key)];
                  return (
                    <td key={String(col.key)} className={col.className}>
                      {col.render ? col.render(value, row) : String(value ?? "—")}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
