"use client";

import { useState, useCallback, useEffect } from "react";
import { workerService } from "@/services/worker.service";
import type { Worker, WorkerFilters, WorkerListResponse } from "@/types/worker.types";
import { toast } from "sonner";

/**
 * Hook for managing worker data — listing, searching, and pagination.
 */
export function useWorkers(initialFilters: WorkerFilters = {}) {
  const [data, setData] = useState<WorkerListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkerFilters>({
    page: 1,
    pageSize: 10,
    ...initialFilters,
  });

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await workerService.getWorkers(filters);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load workers";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const deleteWorker = useCallback(
    async (workerId: string, workerName: string): Promise<boolean> => {
      try {
        await workerService.deleteWorker(workerId);
        toast.success(`${workerName} has been removed`);
        fetchWorkers();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete worker";
        toast.error(message);
        return false;
      }
    },
    [fetchWorkers]
  );

  const updateFilters = useCallback((newFilters: Partial<WorkerFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    workers: data?.workers ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: filters.page ?? 1,
    isLoading,
    error,
    filters,
    updateFilters,
    setPage,
    refresh: fetchWorkers,
    deleteWorker,
  };
}

/**
 * Hook for fetching a single worker's full profile.
 */
export function useWorker(workerId: string) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workerId) return;
    setIsLoading(true);
    workerService
      .getWorker(workerId)
      .then(setWorker)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Worker not found");
      })
      .finally(() => setIsLoading(false));
  }, [workerId]);

  return { worker, isLoading, error };
}
