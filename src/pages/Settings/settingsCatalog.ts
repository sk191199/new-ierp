export const SETTINGS_CATALOG_KEY = "ierp.settings-catalog";
export const SETTINGS_SECTIONS_KEY = "ierp.settings-sections";

export interface SettingsCatalog {
  modules: string[];
  screensByModule: Record<string, string[]>;
}

export const defaultSettingsCatalog: SettingsCatalog = {
  modules: [
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
    "Sales & Distribution": ["Quotation Management", "Sales Orders", "Invoice Management"],
    "Procurement Hub": ["Purchase Requests", "Purchase Orders", "Supplier Invoices"],
    "Inventory & Supply Chain": ["Item Management", "Warehouse Management", "Stock Transfers"],
    "Finance & Treasury": ["General Ledger", "Accounts Payable", "Accounts Receivable"],
    "CRM & Customer Engagement": ["CRM Mission Control", "Lead Management", "Contact Directory", "Opportunity Pipeline", "Activities & Follow-Ups", "Campaign Manager"],
    "HR & Payroll": ["Employee Management", "Leave Management", "Payroll Processing"],
    "Project Management": ["Project Portfolio", "Project Tasks", "Project Billing"],
    Manufacturing: ["Production Planning", "Work Orders", "Quality Control"],
  },
};

const REMOVED_MODULE_KEY = "system & administration";

const removeRetiredModule = (catalog: SettingsCatalog): SettingsCatalog => {
  const screensByModule = Object.fromEntries(
    Object.entries(catalog.screensByModule).filter(
      ([module]) => module.trim().toLowerCase() !== REMOVED_MODULE_KEY,
    ),
  );

  return {
    modules: catalog.modules.filter(
      (module) => module.trim().toLowerCase() !== REMOVED_MODULE_KEY,
    ),
    screensByModule,
  };
};

export const readSettingsCatalog = (): SettingsCatalog => {
  try {
    const rawValue = window.localStorage.getItem(SETTINGS_CATALOG_KEY);
    const stored = JSON.parse(rawValue ?? "null") as Partial<SettingsCatalog> | null;
    const catalog = removeRetiredModule({
      modules: stored?.modules?.length ? stored.modules : defaultSettingsCatalog.modules,
      screensByModule: { ...defaultSettingsCatalog.screensByModule, ...(stored?.screensByModule ?? {}) },
    });

    // Migrate older Local Storage data so retired modules are not recreated on refresh.
    if (rawValue !== JSON.stringify(catalog)) {
      window.localStorage.setItem(SETTINGS_CATALOG_KEY, JSON.stringify(catalog));
    }

    return catalog;
  } catch {
    return defaultSettingsCatalog;
  }
};

export const saveSettingsCatalog = (catalog: SettingsCatalog) => {
  window.localStorage.setItem(SETTINGS_CATALOG_KEY, JSON.stringify(catalog));
  window.dispatchEvent(new CustomEvent<SettingsCatalog>(SETTINGS_CATALOG_KEY, { detail: catalog }));
};

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
