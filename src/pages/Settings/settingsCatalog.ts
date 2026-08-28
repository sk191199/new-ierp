export const SETTINGS_SECTIONS_KEY = "ierp.settings-sections";

export interface SettingsCatalog {
  modules: string[];
  screensByModule: Record<string, string[]>;
}

export const settingsSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const settingsScreenKey = (module: string, screen: string): string =>
  `${settingsSlug(module)}:${settingsSlug(screen)}`;

export const defaultSectionsByScreen: Record<string, string[]> = {
  [settingsScreenKey("CRM & Customer Engagement", "Lead Management")]: ["Primary Information", "Classification", "Additional Information", "Follow-ups"],
};

export const readSectionsByScreen = (): Record<string, string[]> => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SETTINGS_SECTIONS_KEY) ?? "{}") as Record<string, string[]>;
    const migrated = { ...stored };
    const leadKey = settingsScreenKey("CRM & Customer Engagement", "Lead Management");
    if (!migrated[leadKey] && migrated["Lead Management"]) {
      migrated[leadKey] = migrated["Lead Management"];
    }
    return { ...defaultSectionsByScreen, ...migrated };
  } catch {
    return defaultSectionsByScreen;
  }
};

export const saveSectionsByScreen = (sections: Record<string, string[]>) => {
  window.localStorage.setItem(SETTINGS_SECTIONS_KEY, JSON.stringify(sections));
};
