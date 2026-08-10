"use client";

import Link from "next/link";
import { Eye, Trash2, CheckCircle2, XCircle } from "lucide-react";
import type { Worker } from "@/types/worker.types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useState } from "react";
import { format } from "date-fns";

interface WorkerTableProps {
  workers: Worker[];
  onDelete?: (id: string) => void;
}

export function WorkerTable({ workers, onDelete }: WorkerTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (workers.length === 0) {
    return (
      <EmptyState
        title="No workers found"
        description="No workers match your search criteria. Try a different search."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header text-left px-4 py-3">Worker</th>
              <th className="table-header text-left px-4 py-3">ID</th>
              <th className="table-header text-left px-4 py-3">Department</th>
              <th className="table-header text-left px-4 py-3">Phone</th>
              <th className="table-header text-left px-4 py-3">Face</th>
              <th className="table-header text-left px-4 py-3">Status</th>
              <th className="table-header text-left px-4 py-3">Joined</th>
              <th className="table-header text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workers.map((worker) => (
              <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                <td className="table-cell px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
                      {worker.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{worker.fullName}</p>
                      <p className="text-xs text-gray-400">{worker.village}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell px-4">
                  <span className="text-xs font-mono text-gray-600">{worker.workerId}</span>
                </td>
                <td className="table-cell px-4">
                  <span className="text-sm text-gray-600">{worker.department || "—"}</span>
                </td>
                <td className="table-cell px-4">
                  <span className="text-sm text-gray-600">{worker.phone}</span>
                </td>
                <td className="table-cell px-4">
                  {worker.faceEnrolled ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Not Enrolled
                    </span>
                  )}
                </td>
                <td className="table-cell px-4">
                  <StatusBadge status={worker.status || "active"} />
                </td>
                <td className="table-cell px-4">
                  <span className="text-xs text-gray-400">
                    {worker.createdAt ? format(new Date(worker.createdAt), "MMM d, yyyy") : "—"}
                  </span>
                </td>
                <td className="table-cell px-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/supervisor/workers/${worker.id}`}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => setDeleteId(worker.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete worker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-400">{workers.length} workers shown</p>
      </div>

      {onDelete && (
        <ConfirmDialog
          isOpen={deleteId !== null}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            if (deleteId) {
              onDelete(deleteId);
              setDeleteId(null);
            }
          }}
          title="Delete Worker"
          description="Are you sure you want to delete this worker? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </>
  );
}
