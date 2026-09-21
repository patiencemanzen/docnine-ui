import { NativeTab, TabDef } from "@/types/DocumentationTypes";
import { Book, BookOpen, Database, FileCode, FileCode2, ShieldAlert } from "@/components/icons";

export const NATIVE_TABS: TabDef[] = [
  {
    key: "readme",
    label: "README",
    icon: Book,
    field: "readme",
    isNative: true,
  },
  {
    key: "api",
    label: "API Reference",
    icon: FileCode2,
    field: "apiReference",
    isNative: true,
  },
  {
    key: "schema",
    label: "Schema Docs",
    icon: Database,
    field: "schemaDocs",
    isNative: true,
  },
  {
    key: "internal",
    label: "Internal Docs",
    icon: BookOpen,
    field: "internalDocs",
    isNative: true,
  },
  {
    key: "security",
    label: "Security",
    icon: ShieldAlert,
    field: "securityReport",
    isNative: true,
  },
  { key: "other_docs", label: "Other Docs", icon: FileCode, isNative: true },
];

export const TAB_TO_SECTION: Partial<Record<NativeTab, string>> = {
  readme: "readme",
  api: "apiReference",
  schema: "schemaDocs",
  internal: "internalDocs",
  security: "securityReport",
};
