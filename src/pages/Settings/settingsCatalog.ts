export const SETTINGS_CATALOG_KEY = "ierp.settings-catalog";
export const SETTINGS_SECTIONS_KEY = "ierp.settings-sections";

export interface SettingsCatalog {
  modules: string[];
  screensByModule: Record<string, string[]>;
}

export const defaultSettingsCatalog: SettingsCatalog = {
  modules: [
    "System & Administration",
    "Sales & Distribution",
    "Procurement Hub",
    "Inventory & Supply Chain",
    "Finance & Treasury",
    "CRM & Customer Engagement",
    "HR & Payroll",
    "Project Management",
    "Manufacturing",
  ],
  screensByModule: {
    "System & Administration": ["Company (Tenant) Setup", "Subsidiaries", "Branches / Locations", "Document & Number Series", "Unit of Measure (UOM)"],
    "CRM & Customer Engagement": ["CRM Mission Control", "Lead Management", "Contact Directory", "Opportunity Pipeline", "Activities & Follow-Ups", "Campaign Manager"],
  },
};

export const readSettingsCatalog = (): SettingsCatalog => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SETTINGS_CATALOG_KEY) ?? "null") as Partial<SettingsCatalog> | null;
    return {
      modules: stored?.modules?.length ? stored.modules : defaultSettingsCatalog.modules,
      screensByModule: { ...defaultSettingsCatalog.screensByModule, ...(stored?.screensByModule ?? {}) },
    };
  } catch {
    return defaultSettingsCatalog;
  }
};

export const saveSettingsCatalog = (catalog: SettingsCatalog) => {
  window.localStorage.setItem(SETTINGS_CATALOG_KEY, JSON.stringify(catalog));
  window.dispatchEvent(new CustomEvent<SettingsCatalog>(SETTINGS_CATALOG_KEY, { detail: catalog }));
};

export const settingsSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const defaultSectionsByScreen: Record<string, string[]> = {
  "Lead Management": ["Primary Information", "Classification", "Additional Information", "Follow-ups"],
};

export const readSectionsByScreen = (): Record<string, string[]> => {
  try {
    return { ...defaultSectionsByScreen, ...(JSON.parse(window.localStorage.getItem(SETTINGS_SECTIONS_KEY) ?? "{}") as Record<string, string[]>) };
  } catch {
    return defaultSectionsByScreen;
  }
};

export const saveSectionsByScreen = (sections: Record<string, string[]>) => {
  window.localStorage.setItem(SETTINGS_SECTIONS_KEY, JSON.stringify(sections));
};
