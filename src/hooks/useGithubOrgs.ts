import { useState, useCallback } from "react";
import { githubApi } from "@/lib/api";
import { GitHubOrg } from "@/types/GithubTypes";

export function useGithubOrgs() {
  const [githubOrgs, setGithubOrgs] = useState<GitHubOrg[]>([]);
  const [githubOrgsLoading, setGithubOrgsLoading] = useState(false);

  const loadGithubOrgs = useCallback(async () => {
    if (githubOrgs.length > 0) return;

    setGithubOrgsLoading(true);
    try {
      const res = await githubApi.getOrgs();
      setGithubOrgs(res.orgs);
    } catch (err) {
      console.warn("[GitHub Orgs] Failed to load organizations:", err);
      setGithubOrgs([]);
    } finally {
      setGithubOrgsLoading(false);
    }
  }, [githubOrgs.length]);

  return {
    githubOrgs,
    githubOrgsLoading,
    loadGithubOrgs,
  };
}
