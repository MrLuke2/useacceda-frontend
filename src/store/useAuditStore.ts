import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockAuditHistory, AuditHistoryEntry } from "@/lib/mock-data";

interface AuditState {
  audits: AuditHistoryEntry[];
  activeAuditId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAudits: () => Promise<void>;
  setActiveAudit: (id: string | null) => void;
  addAudit: (audit: AuditHistoryEntry) => void;
  deleteAudit: (id: string) => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      audits: [],
      activeAuditId: null,
      isLoading: false,
      error: null,

      fetchAudits: async () => {
        set({ isLoading: true });
        try {
          // Simulate API latency
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Only seed if empty to prevent overwriting persistent state on every refesh
          set((state: AuditState) => ({
            audits: state.audits.length > 0 ? state.audits : mockAuditHistory,
            isLoading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      setActiveAudit: (id: string | null) => set({ activeAuditId: id }),

      addAudit: (audit: AuditHistoryEntry) =>
        set((state: AuditState) => ({
          audits: [audit, ...state.audits],
        })),

      deleteAudit: (id: string) =>
        set((state: AuditState) => ({
          audits: state.audits.filter((a: AuditHistoryEntry) => a.id !== id),
          activeAuditId:
            state.activeAuditId === id ? null : state.activeAuditId,
        })),
    }),
    {
      name: "acceda-audit-storage",
      partialize: (state: AuditState) => ({
        audits: state.audits,
        activeAuditId: state.activeAuditId,
      }),
    },
  ),
);
