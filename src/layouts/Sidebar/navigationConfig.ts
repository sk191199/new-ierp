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

import { ROUTES } from "@/constants/routes";
import type { MetadataModule } from "@/models/metadata/metadata";
import { settingsSlug } from "@/pages/Settings/settingsCatalog";

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

const primaryNavigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: ROUTES.dashboard,
    icon: SpaceDashboardOutlinedIcon,
  },
  {
    label: "AI Control Room",
    path: ROUTES.aiAssistant,
    icon: HubOutlinedIcon,
  },
];

const systemSettingsNavigationItem: NavigationItem = {
  label: "System Settings",
  path: ROUTES.settingsSystem,
  icon: SettingsOutlinedIcon,
};

const moduleIcons: Record<string, SvgIconComponent> = {
  crm: BusinessCenterOutlinedIcon,
  sales: ShoppingCartOutlinedIcon,
  procurement: LocalMallOutlinedIcon,
  inventory: Inventory2OutlinedIcon,
  finance: AccountBalanceOutlinedIcon,
  hr: PeopleAltOutlinedIcon,
  projects: WorkOutlineOutlinedIcon,
  workflow: HubOutlinedIcon,
  reports: SpaceDashboardOutlinedIcon,
  administration: AdminPanelSettingsOutlinedIcon,
};

export const navigationItems = (): NavigationItem[] => primaryNavigationItems;

export const systemSettingsNavigationItems = (): NavigationItem[] => [systemSettingsNavigationItem];

const salesNavigationItem: NavigationItem = {
  label: "Sales",
  icon: ShoppingCartOutlinedIcon,
  children: [
    { label: "Sales Enquiry", path: ROUTES.sales.enquiries },
    { label: "Sales Quotation", path: ROUTES.sales.quotations },
    { label: "Projects", path: ROUTES.sales.projects },
    { label: "Sales Order", path: ROUTES.sales.orders },
    { label: "Sales Invoices", path: ROUTES.sales.invoices },
    { label: "Credit / Debit Notes", path: ROUTES.sales.creditDebitNotes },
    { label: "Delivery Order", path: ROUTES.sales.deliveryOrders },
  ],
};

export const salesNavigationItems = (): NavigationItem[] => [salesNavigationItem];

export const navigationItemsFromModules = (modules: MetadataModule[]): NavigationItem[] =>
  modules.map((module) => ({
    label: module.name,
    icon: moduleIcons[module.code.toLowerCase()] ?? SettingsOutlinedIcon,
    path: module.screens.length === 0 ? `/settings/catalog/${settingsSlug(module.name)}` : undefined,
    children: module.screens.map((screen) => ({
      label: screen.name,
      path: screen.route,
    })),
  }));