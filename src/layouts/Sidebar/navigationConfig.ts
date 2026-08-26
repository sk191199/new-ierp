// import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
// import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
// import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
// import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
// import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
// import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
// import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
// import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
// import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
// import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
// import type { SvgIconComponent } from "@mui/icons-material";
// import { PERMISSIONS } from "@/constants/permissions";
// import { ROUTES } from "@/constants/routes";

// export interface NavigationChild {
//   label: string;
//   path: string;
//   permission?: string;
// }

// export interface NavigationGroup {
//   label: string;
//   items: NavigationChild[];
// }

// export interface NavigationItem {
//   label: string;
//   path?: string;
//   icon: SvgIconComponent;
//   permission?: string;
//   children?: NavigationChild[];
//   groups?: NavigationGroup[];
// }

// export const getNavigationLeaves = (item: NavigationItem): NavigationChild[] =>
//   item.groups?.flatMap((group) => group.items) ?? item.children ?? [];

// export const navigationItems: NavigationItem[] = [
//   {
//     label: "Inventory & Supply Chain",
//     icon: Inventory2OutlinedIcon,
//     children: [
//       { label: "Items", path: ROUTES.inventory.items },
//       { label: "Warehouses", path: ROUTES.inventory.warehouses },
//     ],
//   },
//   {
//     label: "Finance & Treasury",
//     icon: AccountBalanceOutlinedIcon,
//     children: [{ label: "General Ledger", path: ROUTES.finance.ledger }],
//   },
//   {
//     label: "CRM & Customer Engagement",
//     icon: BusinessCenterOutlinedIcon,
//     groups: [
//       {
//         label: "Dashboards",
//         items: [{ label: "CRM Mission Control", path: ROUTES.dashboard, permission: PERMISSIONS.dashboard.view }],
//       },
//       {
//         label: "Transactions",
//         items: [
//           { label: "Lead Management", path: ROUTES.crm.leads, permission: PERMISSIONS.crm.leads.view },
//           { label: "Opportunity Pipeline", path: ROUTES.crm.opportunities },
          
//         ],
//       },
      
//     ],
//   },
//   {
//     label: "Sales & Distribution",
//     icon: ShoppingCartOutlinedIcon,
//     children: [
//       { label: "Quotations", path: ROUTES.sales.quotations },
//       { label: "Orders", path: ROUTES.sales.orders },
//       { label: "Invoices", path: ROUTES.sales.invoices },
//     ],
//   },
//   {
//     label: "Procurement Hub",
//     icon: LocalMallOutlinedIcon,
//     children: [
//       { label: "Orders", path: ROUTES.purchase.orders },
//       { label: "Invoices", path: ROUTES.purchase.invoices },
//     ],
//   },
//   {
//     label: "Human Capital",
//     icon: PeopleAltOutlinedIcon,
//     children: [{ label: "Employees", path: ROUTES.hr.employees }],
//   },
//   {
//     label: "Projects",
//     path: ROUTES.projects.root,
//     icon: WorkOutlineOutlinedIcon,
//   },
//   {
//     label: "Workflow",
//     icon: HubOutlinedIcon,
//     children: [{ label: "Inbox", path: ROUTES.workflow.inbox }],
//   },
//   {
//     label: "Reports",
//     path: ROUTES.reports.root,
//     icon: SpaceDashboardOutlinedIcon,
//   },
//   {
//     label: "Administration",
//     icon: AdminPanelSettingsOutlinedIcon,
//     children: [
//       { label: "Users", path: ROUTES.administration.users },
//       { label: "Roles", path: ROUTES.administration.roles },
//     ],
//   },
//   {
//     label: "Settings",
//     path: ROUTES.settings,
//     icon: SettingsOutlinedIcon,
//   },
// ];


import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { readSettingsCatalog, settingsSlug } from "@/pages/Settings/settingsCatalog";

export interface NavigationChild {
  label: string;
  path: string;
  permission?: string;
}

export interface NavigationItem {
  label: string;
  path?: string;
  icon: SvgIconComponent;
  permission?: string;
  children?: NavigationChild[];
}

export const getNavigationLeaves = (
  item: NavigationItem,
): NavigationChild[] => item.children ?? [];

const baseNavigationItems: NavigationItem[] = [
  {
    label: "Inventory & Supply Chain",
    icon: Inventory2OutlinedIcon,
    children: [
      {
        label: "Items",
        path: ROUTES.inventory.items,
      },
      {
        label: "Warehouses",
        path: ROUTES.inventory.warehouses,
      },
    ],
  },

  {
    label: "Finance & Treasury",
    icon: AccountBalanceOutlinedIcon,
    children: [
      {
        label: "General Ledger",
        path: ROUTES.finance.ledger,
      },
    ],
  },

  {
    label: "CRM & Customer Engagement",
    icon: BusinessCenterOutlinedIcon,
    children: [
      {
        label: "CRM Mission Control",
        path: ROUTES.dashboard,
        permission: PERMISSIONS.dashboard.view,
      },
      {
        label: "Lead Management",
        path: ROUTES.crm.leads,
        permission: PERMISSIONS.crm.leads.view,
      },
      {
        label: "Opportunity Pipeline",
        path: ROUTES.crm.opportunities,
      },
    ],
  },

  {
    label: "Sales & Distribution",
    icon: ShoppingCartOutlinedIcon,
    children: [
      {
        label: "Quotations",
        path: ROUTES.sales.quotations,
      },
      {
        label: "Orders",
        path: ROUTES.sales.orders,
      },
      {
        label: "Invoices",
        path: ROUTES.sales.invoices,
      },
    ],
  },

  {
    label: "Procurement Hub",
    icon: LocalMallOutlinedIcon,
    children: [
      {
        label: "Orders",
        path: ROUTES.purchase.orders,
      },
      {
        label: "Invoices",
        path: ROUTES.purchase.invoices,
      },
    ],
  },

  {
    label: "Human Capital",
    icon: PeopleAltOutlinedIcon,
    children: [
      {
        label: "Employees",
        path: ROUTES.hr.employees,
      },
    ],
  },

  {
    label: "Projects",
    path: ROUTES.projects.root,
    icon: WorkOutlineOutlinedIcon,
  },

  {
    label: "Workflow",
    icon: HubOutlinedIcon,
    children: [
      {
        label: "Inbox",
        path: ROUTES.workflow.inbox,
      },
    ],
  },

  {
    label: "Reports",
    path: ROUTES.reports.root,
    icon: SpaceDashboardOutlinedIcon,
  },

  {
    label: "Administration",
    icon: AdminPanelSettingsOutlinedIcon,
    children: [
      {
        label: "Users",
        path: ROUTES.administration.users,
      },
      {
        label: "Roles",
        path: ROUTES.administration.roles,
      },
    ],
  },

  {
    label: "System Settings",
    path: ROUTES.settings.system,
    icon: SettingsOutlinedIcon,
  },
];

export const navigationItems = (): NavigationItem[] => {
  const configured = readSettingsCatalog();
  const existingLabels = new Set(baseNavigationItems.map((item) => item.label));
  const hiddenLegacyModules = new Set(["hr & payroll", "project management", "manufacturing", "shopping"]);
  const configuredItems = baseNavigationItems.map((item) => {
    const configuredScreens = configured.screensByModule[item.label];
    if (!configuredScreens?.length || !item.children) {
      return item;
    }

    const existingScreens = new Set(item.children.map((child) => child.label));
    return {
      ...item,
      children: [
        ...item.children,
        ...configuredScreens
          .filter((screen) => !existingScreens.has(screen))
          .map((screen) => ({
            label: screen,
            path: `/settings/catalog/${settingsSlug(item.label)}/${settingsSlug(screen)}`,
          })),
      ],
    };
  });
  const dynamicItems = configured.modules
    .filter((module) => !existingLabels.has(module) && !hiddenLegacyModules.has(module.trim().toLowerCase()))
    .map((module) => ({
      label: module,
      icon: SettingsOutlinedIcon,
      path: `/settings/catalog/${settingsSlug(module)}`,
      children: (configured.screensByModule[module] ?? []).map((screen) => ({
        label: screen,
        path: `/settings/catalog/${settingsSlug(module)}/${settingsSlug(screen)}`,
      })),
    }));

  return [...configuredItems, ...dynamicItems];
};