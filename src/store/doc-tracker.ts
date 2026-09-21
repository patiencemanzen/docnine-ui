import { DEFAULT_SECTION } from "@/configs/DocStatusConfig";
import {
  DocSectionTrack,
  DocStatus,
  DocStatusLogEntry,
  Entries,
} from "@/types/DocStatusTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocTrackerState {
  entries: Entries;

  
  setStatus: (
    projectId: string,
    section: string,
    status: DocStatus,
    changedBy?: string,
    note?: string,
  ) => void;

  
  setAssignee: (
    projectId: string,
    section: string,
    assignee: string | undefined,
  ) => void;

  
  setDueDate: (
    projectId: string,
    section: string,
    dueDate: string | undefined,
  ) => void;

  
  getEntry: (projectId: string, section: string) => DocSectionTrack | undefined;

  
  getProjectSummary: (projectId: string) => Record<string, DocSectionTrack>;

  
  isOverdue: (projectId: string, section: string) => boolean;
}

export const useDocTrackerStore = create<DocTrackerState>()(
  persist(
    (set, get) => ({
      entries: {},

      setStatus: (projectId, section, status, changedBy, note) => {
        const now = new Date().toISOString();
        set((state) => {
          const projectEntries = state.entries[projectId] ?? {};
          const existing: DocSectionTrack = projectEntries[section] ?? {
            ...DEFAULT_SECTION,
          };
          const logEntry: DocStatusLogEntry = {
            status,
            changedAt: now,
            changedBy,
            note,
          };
          return {
            entries: {
              ...state.entries,
              [projectId]: {
                ...projectEntries,
                [section]: {
                  ...existing,
                  status,
                  log: [logEntry, ...existing.log].slice(0, 30),
                },
              },
            },
          };
        });
      },

      setAssignee: (projectId, section, assignee) => {
        set((state) => {
          const projectEntries = state.entries[projectId] ?? {};
          const existing: DocSectionTrack = projectEntries[section] ?? {
            ...DEFAULT_SECTION,
          };
          return {
            entries: {
              ...state.entries,
              [projectId]: {
                ...projectEntries,
                [section]: { ...existing, assignee },
              },
            },
          };
        });
      },

      setDueDate: (projectId, section, dueDate) => {
        set((state) => {
          const projectEntries = state.entries[projectId] ?? {};
          const existing: DocSectionTrack = projectEntries[section] ?? {
            ...DEFAULT_SECTION,
          };
          return {
            entries: {
              ...state.entries,
              [projectId]: {
                ...projectEntries,
                [section]: { ...existing, dueDate },
              },
            },
          };
        });
      },

      getEntry: (projectId, section) => {
        return get().entries[projectId]?.[section];
      },

      getProjectSummary: (projectId) => {
        return get().entries[projectId] ?? {};
      },

      isOverdue: (projectId, section) => {
        const entry = get().entries[projectId]?.[section];
        if (!entry?.dueDate) return false;
        const nonOverdueStatuses: DocStatus[] = [
          "approved",
          "published",
          "archived",
        ];
        if (nonOverdueStatuses.includes(entry.status)) return false;
        return new Date(entry.dueDate) < new Date();
      },
    }),
    {
      name: "docnine-doc-tracker",
    },
  ),
);
