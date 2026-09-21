import { NATIVE_TABS } from "@/configs/DocumentationConfig";
import { DocTab, TabDef } from "@/types/DocumentationTypes";
import { CustomTab } from "@/types/ProjectTypes";
import { FileCode } from "@/components/icons";

export function buildTabList(customTabs: CustomTab[] = []): TabDef[] {
  const customDefs: TabDef[] = (customTabs ?? [])
    .sort((a, b) => a.order - b.order)
    .map((ct) => ({
      key: `custom_${ct._id}` as DocTab,
      label: ct.name,
      icon: FileCode,
      isNative: false,
      isCustom: true,
      customTab: ct,
    }));
  return [...NATIVE_TABS.slice(0, -1), ...customDefs, NATIVE_TABS[NATIVE_TABS.length - 1]];
}
