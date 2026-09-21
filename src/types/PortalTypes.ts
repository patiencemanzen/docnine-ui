import { ApiProjectMeta, CustomTab } from "./ProjectTypes";

export type PortalSectionVisibility = "public" | "internal" | "coming_soon";
export type PortalAccessMode = "public" | "password";
export type PortalTemplateId =
  | "classic"
  | "teal-studio"
  | "midnight"
  | "minimal"
  | "company-showcase"
  | "developer-terminal"
  | "enterprise-handbook"
  | "startup-guide"
  | "product-manual"
  | "agency-portfolio";

export type PortalSectionKey =
  | "readme"
  | "internalDocs"
  | "apiReference"
  | "schemaDocs"
  | "securityReport";

export interface PortalSectionConfig {
  sectionKey: PortalSectionKey;
  visibility: PortalSectionVisibility;
}

export interface PortalFooterLink {
  label: string;
  href: string;
}

export interface PortalBranding {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  bgColor?: string;
  accentColor?: string;
  headerText?: string;
  footerText?: string;
  footerLinks?: PortalFooterLink[];
}

export interface ApiPortal {
  _id?: string;
  projectId?: string;
  slug: string;
  isPublished: boolean;
  accessMode: PortalAccessMode;
  templateId?: PortalTemplateId;
  branding: PortalBranding;
  sections: PortalSectionConfig[];
  seoTitle?: string;
  seoDescription?: string;
  customDomain?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicPortalData {
  portal: ApiPortal;
  project: {
    repoOwner: string;
    repoName: string;
    meta: ApiProjectMeta;
    techStack: string[];
  };
  protected: boolean;
  
  content: Record<PortalSectionKey, string | null> | null;
  
  sectionVisibility: Record<PortalSectionKey, PortalSectionVisibility> | null;
}

export interface PortalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  
  initialPortal?: ApiPortal | null;
  
  customTabs?: CustomTab[];
  onPublishChange?: (portal: ApiPortal) => void;
}
