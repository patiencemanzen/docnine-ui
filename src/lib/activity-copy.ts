/**
 * Shared activity-log copy for the account page and project overview.
 */

import type { ActivityLog } from "@/types/activity-log"

const SECTION_LABELS: Record<string, string> = {
  readme: "README",
  apiReference: "API reference",
  schemaDocs: "schema docs",
  internalDocs: "internal docs",
  securityReport: "security report",
}

const ROLE_LABELS: Record<string, string> = {
  viewer: "viewer",
  editor: "editor",
  owner: "owner",
}

export const SESSION_NOISE_ACTIONS = new Set([
  "AUTH_LOGIN",
  "AUTH_LOGOUT",
  "AUTH_SIGNUP",
])

export const CATEGORY_LABELS: Record<string, string> = {
  auth: "Account",
  project: "Project",
  pipeline: "Documentation",
  doc: "Edits",
  security: "Security",
  apispec: "API spec",
  attachment: "Files",
  sharing: "Sharing",
  portal: "Portal",
  export: "Exports",
  integration: "Integrations",
  subscription: "Billing",
  system: "System",
}

function sectionLabel(section?: unknown) {
  if (!section || typeof section !== "string") return "a section"
  return SECTION_LABELS[section] || section.replace(/_/g, " ")
}

function projectPhrase(projectName?: string, asObject = false) {
  const name = (projectName || "").trim()
  if (!name) return asObject ? "this project" : ""
  return asObject ? name : ` for ${name}`
}

export function formatActivityLabel(
  log: ActivityLog,
  opts: { viewerUserId?: string } = {},
): string {
  if (log.summary && !opts.viewerUserId) return log.summary

  const isSelf = !!(opts.viewerUserId && log.userId === opts.viewerUserId)
  const actor = isSelf
    ? "You"
    : log.actorName?.trim() || log.actorEmail?.trim() || "A teammate"
  const project = log.projectName?.trim()
  const forProject = projectPhrase(project)
  const projectObj = projectPhrase(project, true)
  const meta = (log.metadata ?? {}) as Record<string, any>

  if (log.summary && isSelf) {
    const name = log.actorName?.trim()
    if (name && log.summary.startsWith(name)) {
      return `You${log.summary.slice(name.length)}`
    }
  }
  if (log.summary) return log.summary

  switch (log.action) {
    case "AUTH_PASSWORD_CHANGED":
      return isSelf ? "You changed your password" : `${actor} changed their password`
    case "AUTH_EMAIL_VERIFIED":
      return isSelf ? "You verified your email" : `${actor} verified their email`
    case "AUTH_PASSWORD_RESET":
      return isSelf ? "You reset your password" : `${actor} reset their password`

    case "PROJECT_CREATED":
      return `${actor} created ${projectObj}`
    case "PROJECT_DELETED":
      return `${actor} deleted ${projectObj}`
    case "PROJECT_UPDATED":
      return `${actor} updated ${projectObj}`
    case "PROJECT_ARCHIVED":
      return `${actor} archived ${projectObj}`
    case "PROJECT_RESTORED":
      return `${actor} restored ${projectObj}`
    case "PROJECT_RETRIED":
      return `${actor} retried documentation for ${projectObj}`

    case "PIPELINE_STARTED":
      return `${actor} started documentation${forProject}`
    case "PIPELINE_COMPLETED":
      return `Documentation finished${forProject}`
    case "PIPELINE_FAILED":
      return meta.error
        ? `Documentation failed${forProject}: ${meta.error}`
        : `Documentation failed${forProject}`
    case "PIPELINE_TIMEOUT":
      return `Documentation timed out${forProject}`

    case "DOC_SECTION_EDITED":
      return `${actor} edited ${sectionLabel(meta.section)}${forProject}`
    case "DOC_SECTION_RESTORED":
      return `${actor} restored ${sectionLabel(meta.section)} to an earlier version${forProject}`
    case "DOC_VERSION_CREATED":
      return `${actor} saved a version of ${sectionLabel(meta.section)}${forProject}`
    case "DOC_VERSION_RESTORED":
      return `${actor} restored a previous version${forProject}`

    case "SECURITY_SCAN_COMPLETED":
      return `Security scan completed${forProject}`
    case "SECURITY_FINDING_CRITICAL":
      return `Critical security finding${forProject}`
    case "SECURITY_FINDING_HIGH":
      return `High-severity security finding${forProject}`

    case "APISPEC_GENERATED":
      return `${actor} imported an API spec${forProject}`
    case "APISPEC_UPDATED":
      return `${actor} updated the API spec${forProject}`

    case "ATTACHMENT_UPLOADED":
      return `${actor} uploaded ${meta.filename || "a file"}${forProject}`
    case "ATTACHMENT_DELETED":
      return `${actor} removed ${meta.filename || "a file"}${forProject}`

    case "SHARE_INVITE_SENT": {
      const role = ROLE_LABELS[meta.role] || meta.role || "collaborator"
      return `${actor} invited ${meta.inviteeEmail || "a teammate"} as ${role} to ${projectObj}`
    }
    case "SHARE_INVITE_ACCEPTED":
      return `${meta.inviteeEmail || actor} joined ${projectObj}`
    case "SHARE_MEMBER_REMOVED":
      return `${actor} removed ${meta.inviteeEmail || "a collaborator"} from ${projectObj}`
    case "SHARE_ROLE_CHANGED": {
      const role = ROLE_LABELS[meta.newRole] || meta.newRole || "a new role"
      return `${actor} changed ${meta.inviteeEmail || "a collaborator"}'s role to ${role} on ${projectObj}`
    }

    case "PORTAL_PUBLISHED":
      return `${actor} published the docs portal${forProject}`
    case "PORTAL_UNPUBLISHED":
      return `${actor} unpublished the docs portal${forProject}`
    case "PORTAL_SETTINGS_UPDATED":
      return `${actor} updated portal settings${forProject}`

    case "EXPORT_PDF":
      return `${actor} exported a PDF${forProject}`
    case "EXPORT_YAML":
      return `${actor} exported YAML${forProject}`
    case "EXPORT_NOTION":
      return `${actor} exported to Notion${forProject}`
    case "EXPORT_GOOGLE_DOCS":
      return `${actor} exported to Google Docs${forProject}`

    case "INTEGRATION_GITHUB_CONNECTED":
      return `${actor} connected GitHub`
    case "INTEGRATION_GITHUB_DISCONNECTED":
      return `${actor} disconnected GitHub`
    case "INTEGRATION_GITLAB_CONNECTED":
      return `${actor} connected GitLab`
    case "INTEGRATION_GITLAB_DISCONNECTED":
      return `${actor} disconnected GitLab`
    case "INTEGRATION_BITBUCKET_CONNECTED":
      return `${actor} connected Bitbucket`
    case "INTEGRATION_BITBUCKET_DISCONNECTED":
      return `${actor} disconnected Bitbucket`
    case "INTEGRATION_NOTION_CONNECTED":
    case "INTEGRATION_NOTION_CONFIGURED":
      return `${actor} connected Notion`
    case "INTEGRATION_NOTION_DISCONNECTED":
      return `${actor} disconnected Notion`
    case "INTEGRATION_GOOGLE_DOCS_CONNECTED":
    case "INTEGRATION_GOOGLE_CONNECTED":
      return `${actor} connected Google Docs`
    case "INTEGRATION_GOOGLE_DOCS_DISCONNECTED":
    case "INTEGRATION_GOOGLE_DISCONNECTED":
      return `${actor} disconnected Google Docs`
    case "INTEGRATION_WEBHOOK_CREATED":
      return `${actor} set up repository webhooks`
    case "INTEGRATION_WEBHOOK_ROTATED":
      return `${actor} rotated the webhook secret`
    case "INTEGRATION_SLACK_CONNECTED":
    case "INTEGRATION_SLACK_CONFIGURED":
      return `${actor} connected Slack`
    case "INTEGRATION_SLACK_DISCONNECTED":
      return `${actor} disconnected Slack`
    case "INTEGRATION_AZURE_CONNECTED":
      return `${actor} connected Azure DevOps`
    case "INTEGRATION_AZURE_DISCONNECTED":
      return `${actor} disconnected Azure DevOps`

    case "SUBSCRIPTION_UPGRADED":
      if (meta.adminGrant) {
        return meta.plan ? `${actor} granted the ${meta.plan} plan` : `${actor} granted a plan`
      }
      return meta.plan ? `${actor} upgraded to ${meta.plan}` : `${actor} upgraded the subscription`
    case "SUBSCRIPTION_DOWNGRADED":
      if (meta.adminGrant) {
        return meta.plan ? `${actor} set the plan to ${meta.plan}` : `${actor} changed the plan`
      }
      return meta.plan ? `${actor} switched to ${meta.plan}` : `${actor} changed the subscription`
    case "SUBSCRIPTION_CANCELLED":
      return `${actor} cancelled the subscription`
    case "SUBSCRIPTION_PAYMENT_FAILED":
      return "A subscription payment failed"
    case "SUBSCRIPTION_TRIAL_STARTED":
      return `${actor} started a trial`
    case "SUBSCRIPTION_TRIAL_ENDED":
      return "The trial ended"
    case "ADMIN_USER_UPDATED": {
      const bits: string[] = []
      if (meta.role) bits.push(`role to ${meta.role}`)
      if (meta.isEmailVerified === true) bits.push("email as verified")
      if (meta.isEmailVerified === false) bits.push("email as unverified")
      if (meta.revokeSessions) bits.push("signed them out")
      return bits.length
        ? `${actor} updated this account (${bits.join(", ")})`
        : `${actor} updated this account`
    }

    case "API_TOKEN_CREATED":
      return meta.name
        ? `${actor} created API token “${meta.name}”`
        : `${actor} created an API token`
    case "API_TOKEN_REVOKED":
      return meta.name
        ? `${actor} revoked API token “${meta.name}”`
        : `${actor} revoked an API token`

    case "SYSTEM_ERROR":
      return meta.message ? `Something went wrong: ${meta.message}` : "Something went wrong"

    default:
      return `${actor} ${log.action.replace(/_/g, " ").toLowerCase()}`
  }
}

const HIDDEN_META_KEYS = new Set([
  "jobId",
  "provider",
  "owner",
  "repoName",
  "repoUrl",
  "inviteeEmail",
  "role",
  "newRole",
  "section",
  "slug",
  "filename",
  "name",
  "plan",
  "grantedBy",
  "updatedBy",
  "adminGrant",
])

export function visibleMetadata(metadata?: Record<string, unknown> | null) {
  if (!metadata) return {}
  return Object.fromEntries(
    Object.entries(metadata).filter(
      ([k, v]) => v != null && v !== "" && !HIDDEN_META_KEYS.has(k),
    ),
  )
}
