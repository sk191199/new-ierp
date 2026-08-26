import { lazy, Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { ROUTES } from "@/constants/routes";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

const LoginPage = lazy(() =>
  import("@/pages/Auth/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages/Dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const LeadsPage = lazy(() =>
  import("@/pages/CRM/Leads/LeadsPage").then((module) => ({ default: module.LeadsPage })),
);
const LeadEditorPage = lazy(() =>
  import("@/pages/CRM/Leads/LeadEditorPage").then((module) => ({ default: module.LeadEditorPage })),
);
const LeadViewPage = lazy(() =>
  import("@/pages/CRM/Leads/LeadViewPage").then((module) => ({ default: module.LeadViewPage })),
);
const OpportunitiesPage = lazy(() =>
  import("@/pages/CRM/Opportunities/OpportunitiesPage").then((module) => ({
    default: module.OpportunitiesPage,
  })),
);
const OpportunityViewPage = lazy(() =>
  import("@/pages/CRM/Opportunities/OpportunityViewPage").then((module) => ({
    default: module.OpportunityViewPage,
  })),
);
const OpportunityEditPage = lazy(() =>
  import("@/pages/CRM/Opportunities/OpportunityEditPage").then((module) => ({
    default: module.OpportunityEditPage,
  })),
);
const CustomerMasterPage = lazy(() =>
  import("@/pages/Masters/CustomerMasterPage").then((module) => ({
    default: module.CustomerMasterPage,
  })),
);
const ModulePlaceholder = lazy(() =>
  import("@/pages/ModulePlaceholder/ModulePlaceholder").then((module) => ({
    default: module.ModulePlaceholder,
  })),
);
const SystemSettingsPage = lazy(() =>
  import("@/pages/Settings/SystemSettingsPage").then((module) => ({
    default: module.SystemSettingsPage,
  })),
);

const RouteFallback = () => <LoadingState label="Loading workspace…" minHeight={360} />;

export const AppRoutes = () => {
  const element = useRoutes([
    {
      element: <GuestRoute />,
      children: [{ path: ROUTES.login, element: <LoginPage /> }],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: "/", element: <Navigate to={ROUTES.dashboard} replace /> },
            { path: ROUTES.dashboard, element: <DashboardPage /> },
            {
              path: ROUTES.crm.missionControl,
              element: <Navigate to={ROUTES.dashboard} replace />,
            },
            { path: ROUTES.crm.leads, element: <LeadsPage /> },
            { path: ROUTES.crm.leadNew, element: <LeadEditorPage mode="create" /> },
            { path: ROUTES.crm.leadEdit(":id"), element: <LeadEditorPage mode="edit" /> },
            { path: "/crm/leads/:id", element: <LeadViewPage /> },
            { path: ROUTES.masters.customers, element: <CustomerMasterPage /> },
            {
              path: ROUTES.aiAssistant,
              element: <ModulePlaceholder title="AI Assistant" module="Intelligence" />,
            },
            {
              path: ROUTES.crm.contacts,
              element: <ModulePlaceholder title="Contact Directory" module="CRM" />,
            },
            { path: ROUTES.crm.opportunities, element: <OpportunitiesPage /> },
            { path: "/crm/opportunities/:id", element: <OpportunityViewPage /> },
            { path: "/crm/opportunities/:id/edit", element: <OpportunityEditPage /> },
            {
              path: ROUTES.crm.activities,
              element: <ModulePlaceholder title="Activities & Follow-Ups" module="CRM" />,
            },
            {
              path: ROUTES.crm.campaigns,
              element: <ModulePlaceholder title="Campaign Manager" module="CRM" />,
            },
            {
              path: ROUTES.sales.quotations,
              element: <ModulePlaceholder title="Quotations" module="Sales" />,
            },
            {
              path: ROUTES.sales.orders,
              element: <ModulePlaceholder title="Sales Orders" module="Sales" />,
            },
            {
              path: ROUTES.sales.invoices,
              element: <ModulePlaceholder title="Sales Invoices" module="Sales" />,
            },
            {
              path: ROUTES.purchase.orders,
              element: <ModulePlaceholder title="Purchase Orders" module="Purchase" />,
            },
            {
              path: ROUTES.purchase.invoices,
              element: <ModulePlaceholder title="Purchase Invoices" module="Purchase" />,
            },
            {
              path: ROUTES.inventory.items,
              element: <ModulePlaceholder title="Items" module="Inventory" />,
            },
            {
              path: ROUTES.inventory.warehouses,
              element: <ModulePlaceholder title="Warehouses" module="Inventory" />,
            },
            {
              path: ROUTES.finance.ledger,
              element: <ModulePlaceholder title="General Ledger" module="Finance" />,
            },
            {
              path: ROUTES.hr.employees,
              element: <ModulePlaceholder title="Employees" module="HR" />,
            },
            {
              path: ROUTES.projects.root,
              element: <ModulePlaceholder title="Projects" module="Projects" />,
            },
            {
              path: ROUTES.workflow.inbox,
              element: <ModulePlaceholder title="Approval Inbox" module="Workflow" />,
            },
            {
              path: ROUTES.reports.root,
              element: <ModulePlaceholder title="Reports" module="Reports" />,
            },
            {
              path: ROUTES.administration.users,
              element: <ModulePlaceholder title="Users" module="Administration" />,
            },
            {
              path: ROUTES.administration.roles,
              element: <ModulePlaceholder title="Roles" module="Administration" />,
            },
            {
              path: ROUTES.settings.system,
              element: <SystemSettingsPage />,
            },
          ],
        },
      ],
    },
    { path: "*", element: <Navigate to={ROUTES.dashboard} replace /> },
  ]);

  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
};
