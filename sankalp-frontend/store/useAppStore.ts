import { create } from "zustand";
import type { AttendanceRecord } from "@/types/attendance.types";

interface AppState {
  // Attendance session
  sessionId: string | null;
  isSessionActive: boolean;
  todayFeed: AttendanceRecord[];
  pendingReviewCount: number;

  // UI state
  sidebarCollapsed: boolean;
  darkMode: boolean;

  // Actions
  setSession: (sessionId: string | null, isActive: boolean) => void;
  setTodayFeed: (records: AttendanceRecord[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  setPendingReviewCount: (count: number) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionId: null,
  isSessionActive: false,
  todayFeed: [],
  pendingReviewCount: 0,
  sidebarCollapsed: false,
  darkMode: false,

  setSession: (sessionId, isActive) =>
    set({ sessionId, isSessionActive: isActive }),

  setTodayFeed: (records) => set({ todayFeed: records }),

  addAttendanceRecord: (record) =>
    set((state) => ({
      todayFeed: [record, ...state.todayFeed],
    })),

  setPendingReviewCount: (count) => set({ pendingReviewCount: count }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
