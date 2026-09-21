import React, { useState, useEffect } from "react";
import { Loader, AlertCircle, CheckCircle } from "@/components/icons";
import { API_BASE, getAccessToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { fromApiProject } from "@/store/projects";

function getAuthToken() {
    return getAccessToken() ?? "";
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
    };
}

export function ProjectGeneralSettings({ project, onProjectUpdate }) {
    const [projectName, setProjectName] = useState(project?.name ?? "");
    const [projectDescription, setProjectDescription] = useState(project?.description ?? "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setProjectName(project?.name ?? "");
        setProjectDescription(project?.description ?? "");
        setIsDirty(false);
    }, [project]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleNameChange = (value) => {
        setProjectName(value);
        setIsDirty(true);
    };

    const handleDescriptionChange = (value) => {
        setProjectDescription(value);
        setIsDirty(true);
    };

    const handleSaveChanges = async () => {
        try {
            if (!projectName.trim()) {
                setError("Project name is required");
                return;
            }

            setLoading(true);
            setError(null);

            const res = await fetch(`${API_BASE}/projects/${project.id}`, {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({
                    name: projectName.trim(),
                    description: projectDescription.trim(),
                }),
            });

            if (res.status === 401) {
                setError("Session expired. Please log in again.");
                return;
            }

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error?.message ?? "Failed to update project");
            }

            const body = await res.json();
            const apiProject = body?.data?.project ?? body?.data;
            const updatedProject = apiProject?.meta
                ? fromApiProject(apiProject, project?.shareRole ?? "owner")
                : {
                    ...project,
                    name: projectName.trim(),
                    description: projectDescription.trim(),
                };

            if (onProjectUpdate) {
                onProjectUpdate(updatedProject);
            }

            setIsDirty(false);
            showSuccess("Project settings saved successfully");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-[13px] text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                </div>
            )}

            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle className="text-[15px] font-semibold">Project Information</CardTitle>
                    <CardDescription className="text-[13px]">
                        Update your project name and description.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="project-name" className="text-[13px]">Project Name</Label>
                        <Input
                            id="project-name"
                            value={projectName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g., My Documentation"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="project-description" className="text-[13px]">Description</Label>
                        <Textarea
                            id="project-description"
                            value={projectDescription}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Add a description of your project (optional)"
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Button
                            size="sm"
                            onClick={handleSaveChanges}
                            disabled={loading || !isDirty}
                            className="gap-1.5"
                        >
                            {loading && <Loader className="h-3.5 w-3.5 animate-spin" />}
                            Save Changes
                        </Button>
                        {isDirty && (
                            <span className="text-[12px] text-muted-foreground">
                                You have unsaved changes
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle className="text-[15px] font-semibold">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Project ID</p>
                            <p className="text-[12px] font-mono text-foreground break-all">{project?.id}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                            <p className="text-[13px] capitalize">{project?.status ?? "Unknown"}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Created</p>
                            <p className="text-[13px]">
                                {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Unknown"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Your Role</p>
                            <p className="text-[13px] capitalize">{project?.shareRole ?? "Owner"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
