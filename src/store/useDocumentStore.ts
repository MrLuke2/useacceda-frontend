import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockDocuments, DocumentEntry } from "@/lib/mock-data";

interface DocumentState {
  documents: DocumentEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: DocumentEntry) => void;
  updateDocumentStatus: (id: string, status: DocumentEntry["status"]) => void;
  deleteDocument: (id: string) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      documents: [],
      isLoading: false,
      error: null,

      fetchDocuments: async () => {
        set({ isLoading: true });
        try {
          // Simulate latency
          await new Promise((resolve) => setTimeout(resolve, 600));
          
          set((state: DocumentState) => ({
            documents: state.documents.length > 0 ? state.documents : mockDocuments,
            isLoading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      addDocument: (doc) =>
        set((state: DocumentState) => ({
          documents: [doc, ...state.documents],
        })),

      updateDocumentStatus: (id, status) =>
        set((state: DocumentState) => ({
          documents: state.documents.map((d: DocumentEntry) =>
            d.id === id ? { ...d, status } : d
          ),
        })),

      deleteDocument: (id) =>
        set((state: DocumentState) => ({
          documents: state.documents.filter((d: DocumentEntry) => d.id !== id),
        })),
    }),
    {
      name: "acceda-document-storage",
    }
  )
);
