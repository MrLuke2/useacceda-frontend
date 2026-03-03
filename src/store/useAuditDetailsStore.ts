import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockAuditData, AuditSummary } from "@/lib/mock-data";

interface AuditDetailsState {
  auditDetails: Record<string, AuditSummary>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAuditDetails: (id: string) => Promise<void>;
}

export const useAuditDetailsStore = create<AuditDetailsState>()(
  persist(
    (set, get) => ({
      auditDetails: {},
      isLoading: false,
      error: null,

      fetchAuditDetails: async (id: string) => {
        // If we already have it, don't fetch (unless we implement refresh)
        if (get().auditDetails[id]) return;

        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // For now, we only have mock data for v2.4.1. 
          // If ID is different, we'll just clone mock data with new ID for demo.
          const data = id === "v2.4.1" || id === "audit-id" 
            ? mockAuditData 
            : { ...mockAuditData, id };

          set((state: AuditDetailsState) => ({
            auditDetails: { ...state.auditDetails, [id]: data },
            isLoading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: "acceda-audit-details-storage",
    }
  )
);
