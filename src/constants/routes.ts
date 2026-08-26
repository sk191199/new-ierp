/**
 * Central route catalog. Pages and navigation must import from here so a
 * path change does not require hunting string literals across the app.
 */
export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  aiAssistant: "/ai-assistant",
  crm: {
    root: "/crm",
    missionControl: "/crm/mission-control",
    leads: "/crm/leads",
    leadNew: "/crm/leads/new",
    leadView: (id: string) => `/crm/leads/${id}`,
    leadEdit: (id: string) => `/crm/leads/${id}/edit`,
    contacts: "/crm/contacts",
    opportunities: "/crm/opportunities",
    opportunityView: (id: string) => `/crm/opportunities/${id}`,
    opportunityEdit: (id: string) => `/crm/opportunities/${id}/edit`,
    activities: "/crm/activities",
    campaigns: "/crm/campaigns",
  },
  sales: {
    root: "/sales",
    quotations: "/sales/quotations",
    orders: "/sales/orders",
    invoices: "/sales/invoices",
  },
  purchase: {
    root: "/purchase",
    orders: "/purchase/orders",
    invoices: "/purchase/invoices",
  },
  inventory: {
    root: "/inventory",
    items: "/inventory/items",
    warehouses: "/inventory/warehouses",
  },
  finance: {
    root: "/finance",
    ledger: "/finance/ledger",
    invoices: "/finance/invoices",
  },
  hr: {
    root: "/hr",
    employees: "/hr/employees",
  },
  projects: {
    root: "/projects",
  },
  workflow: {
    root: "/workflow",
    inbox: "/workflow/inbox",
  },
  reports: {
    root: "/reports",
  },
  administration: {
    root: "/administration",
    users: "/administration/users",
    roles: "/administration/roles",
  },
  masters: {
    root: "/masters",
    customers: "/masters/customers",
  },
  settings: {
    root: "/settings",
    system: "/settings/system",
  },
} as const;
