import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockRemediations, Remediation } from "@/lib/mock-data";

interface RemediationState {
  remediations: Remediation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRemediations: () => Promise<void>;
  addRemediation: (remediation: Remediation) => void;
  deleteRemediation: (id: string) => void;
}

export const useRemediationStore = create<RemediationState>()(
  persist(
    (set) => ({
      remediations: [],
      isLoading: false,
      error: null,

      fetchRemediations: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          set((state: RemediationState) => ({
            remediations: state.remediations.length > 0 ? state.remediations : mockRemediations,
            isLoading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      addRemediation: (remediation) =>
        set((state: RemediationState) => ({
          remediations: [remediation, ...state.remediations],
        })),

      deleteRemediation: (id) =>
        set((state: RemediationState) => ({
          remediations: state.remediations.filter((r: Remediation) => r.id !== id),
        })),
    }),
    {
      name: "acceda-remediations-storage",
    }
  )
);
