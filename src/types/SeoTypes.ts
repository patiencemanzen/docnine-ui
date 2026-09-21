export interface SeoConfig {
  title: string;
  description?: string;
  pathname?: string;
  canonicalUrl?: string;
  robots?: string;
  keywords?: string[];
  type?: "website" | "article";
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string;
  siteName?: string;
  locale?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  structuredDataId?: string;
  
  appendSiteName?: boolean;
}
