import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockFindings, mockFindingDetails, Finding, FindingDetail, FindingStatus } from "@/lib/mock-data";

interface FindingState {
  findings: Finding[];
  findingDetails: Record<string, FindingDetail>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFindings: () => Promise<void>;
  fetchFindingDetail: (id: string) => Promise<void>;
  updateFindingStatus: (id: string, status: FindingStatus) => void;
  addFinding: (finding: Finding) => void;
}

export const useFindingStore = create<FindingState>()(
  persist(
    (set, get) => ({
      findings: [],
      findingDetails: {},
      isLoading: false,
      error: null,

      fetchFindings: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state: FindingState) => ({
            findings: state.findings.length > 0 ? state.findings : mockFindings,
            isLoading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      fetchFindingDetail: async (id: string) => {
        const existingDetail = get().findingDetails[id];
        if (existingDetail) return;

        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const detail = mockFindingDetails[id];
          if (detail) {
            set((state: FindingState) => ({
              findingDetails: { ...state.findingDetails, [id]: detail },
              isLoading: false,
            }));
          } else {
            set({ error: "Finding not found", isLoading: false });
          }
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      updateFindingStatus: (id, status) =>
        set((state: FindingState) => {
          const updatedFindings = state.findings.map((f: Finding) =>
            f.id === id ? { ...f, status } : f
          );
          const updatedDetails = { ...state.findingDetails };
          if (updatedDetails[id]) {
            updatedDetails[id] = { ...updatedDetails[id], status };
          }
          return { findings: updatedFindings, findingDetails: updatedDetails };
        }),

      addFinding: (finding) =>
        set((state: FindingState) => ({
          findings: [finding, ...state.findings],
        })),
    }),
    {
      name: "acceda-findings-storage",
    }
  )
);
