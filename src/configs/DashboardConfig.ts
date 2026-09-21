export const STATUS_API_MAP: Record<string, string> = {
  all: "",
  analyzing: "queued,running",
  completed: "done",
  failed: "error",
  archived: "archived",
};

export const SORT_API_MAP: Record<string, string> = {
  updated: "-updatedAt",
  created: "-createdAt",
  name: "repoName",
};
