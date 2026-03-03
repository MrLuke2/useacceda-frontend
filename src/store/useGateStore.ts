import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockGateResult, Severity } from "@/lib/mock-data";

// Type definition based on mockGateResult structure
export interface GateFinding {
  id: string;
  severity: Severity;
  ruleId: string;
  elementHash: string;
  pageUrl: string;
}

export interface GateResult {
  passed: boolean;
  failureReasons: string[];
  newBlockingViolations: GateFinding[];
  regressions: GateFinding[];
  config: {
    maxNewCritical: number;
    maxNewSerious: number;
    blockRegressions: boolean;
    baselineAuditId: string;
  };
}

interface GateState {
  gateResults: Record<string, GateResult>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGateResult: (id: string) => Promise<void>;
}

export const useGateStore = create<GateState>()(
  persist(
    (set, get) => ({
      gateResults: {},
      isLoading: false,
      error: null,

      fetchGateResult: async (id: string) => {
        if (get().gateResults[id]) return;

        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          // Using mock data for demo
          const data = mockGateResult;

          set((state: GateState) => ({
            gateResults: { ...state.gateResults, [id]: data },
            isLoading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: "acceda-gate-storage",
    }
  )
);
