import { create } from "zustand";
import { projectsApi, sharingApi } from "@/lib/api";
import {
  ApiProject,
  ApiProjectStatus,
  Project,
  ProjectState,
  ProjectStatus,
} from "@/types/ProjectTypes";
import { ApiSharedProject } from "@/types/ProjectShareTypes";

export function mapApiStatus(apiStatus: ApiProjectStatus): ProjectStatus {
  switch (apiStatus) {
    case "queued":
    case "running":
      return "analyzing";
    case "done":
      return "completed";
    case "archived":
      return "archived";
    case "error":
    default:
      return "failed";
  }
}

export function fromApiProject(
  p: ApiProject,
  shareRole: "owner" | "editor" | "viewer" = "owner",
): Project {
  return {
    id: p._id,
    name: p.meta?.name || p.repoName || p.repoUrl.split("/").pop() || p.repoUrl,
    description: p.meta?.description ?? "",
    repoOwner: p.repoOwner || "",
    repoUrl: p.repoUrl,
    status: mapApiStatus(p.status),
    apiStatus: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    shareRole,
    readme: p.output?.readme,
    apiReference: p.output?.apiReference,
    schemaDocs: p.output?.schemaDocs,
    internalDocs: p.output?.internalDocs,
    securityReport: p.output?.securityReport,
    lastSyncedCommit: p.lastDocumentedCommit ?? null,
    lastSyncedAt: p.stats?.lastSyncedAt ?? null,
    provider: (p as any).provider ?? "github",
  };
}

export function fromSharedApiProject(p: ApiSharedProject): Project {
  return {
    id: p._id,
    name: p.meta?.name || p.repoName || p.repoUrl.split("/").pop() || p.repoUrl,
    repoOwner: p.repoOwner || "",
    repoUrl: p.repoUrl,
    status: mapApiStatus(p.status as ApiProjectStatus),
    apiStatus: p.status as ApiProjectStatus,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    shareRole: p.shareRole,
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  sharedProjects: [],
  sharedLoading: false,
  sharedError: null,

  fetchProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await projectsApi.list(params);
      set({
        projects: data.projects.map((p) => fromApiProject(p)),
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err?.message ?? "Failed to load projects.",
      });
    }
  },

  createProject: async (repoUrl) => {
    const data = await projectsApi.create(repoUrl);
    const project = fromApiProject(data.project);

    set((state) => ({
      projects: [project, ...state.projects],
      total: state.total + 1,
    }));
    return { ...project, streamUrl: data.streamUrl };
  },

  deleteProject: async (id) => {
    await projectsApi.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      total: Math.max(0, state.total - 1),
    }));
  },

  archiveProject: async (id) => {
    const data = await projectsApi.update(id, { status: "archived" });
    const updated = fromApiProject(data.project);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
    }));
  },

  retryProject: async (id) => {
    const data = await projectsApi.retry(id);
    const project = fromApiProject(data.project);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? project : p)),
    }));
    return { ...project, streamUrl: data.streamUrl };
  },

  getProject: async (id) => {
    const data = await projectsApi.get(id);
    const project = fromApiProject(data.project, data.shareRole ?? "owner");

    set((state) => {
      const exists = state.projects.some((p) => p.id === id);

      return {
        projects: exists
          ? state.projects.map((p) => (p.id === id ? project : p))
          : [project, ...state.projects],
      };
    });

    return project;
  },

  getProjectData: async (id) => {
    const data = await projectsApi.get(id);
    const project = data.project;

    return {
      project,
      editedSections: data.editedSections,
      effectiveOutput: data.effectiveOutput,
      lastSyncedCommit: data.lastSyncedCommit,
      shareRole: data.shareRole ?? "owner",
    } as {
      project: ApiProject;
      editedSections: any;
      effectiveOutput: any;
      lastSyncedCommit: string;
      shareRole: "owner" | "editor" | "viewer";
    };
  },

  updateLocalProject: (id, changes) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...changes } : p)),
    }));
  },

  fetchSharedProjects: async () => {
    set({ sharedLoading: true, sharedError: null });
    try {
      const data = await sharingApi.getSharedProjects();
      set({
        sharedProjects: data.projects.map(fromSharedApiProject),
        sharedLoading: false,
      });
    } catch (err: any) {
      set({
        sharedLoading: false,
        sharedError: err?.message ?? "Failed to load shared projects.",
      });
    }
  },
}));
