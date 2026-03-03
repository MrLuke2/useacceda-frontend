import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockAlerts, Alert } from "@/lib/mock-data";

interface AlertState {
  alerts: Alert[];
  
  // Actions
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      alerts: mockAlerts,

      addAlert: (alert) => set((state) => ({
        alerts: [
          {
            ...alert,
            id: `alert-${Date.now()}`,
            timestamp: "Just now",
            read: false,
          },
          ...state.alerts,
        ],
      })),

      markAsRead: (id) => set((state) => ({
        alerts: state.alerts.map((a) => a.id === id ? { ...a, read: true } : a),
      })),

      markAllAsRead: () => set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, read: true })),
      })),

      clearAlerts: () => set({ alerts: [] }),
    }),
    {
      name: "acceda-alerts-storage",
    }
  )
);
