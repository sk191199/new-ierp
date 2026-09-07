# i-ERP Frontend Architecture

This document describes the **i-ERP Intelligent Platform** frontend as implemented today: folder layout, libraries, runtime flows, and the rules that keep the UI scalable as a SaaS ERP rather than a set of isolated pages.

The backend contract this UI is built against:

- ASP.NET Core 8
- PostgreSQL
- REST under `/api/v1/`
- JWT access token (15 minutes, in memory)
- Refresh token (HttpOnly cookie, 7 days, rotated)
- Envelope responses: `{ success, data, message }` and `{ success, error, message, field }`

---

## 1. Product intent

i-ERP is a multi-tenant ERP platform. The frontend is a **shell + primitives** foundation, not a complete ERP catalog.

It is designed so future modules can reuse:

- Application chrome (sidebar, top bar, content)
- Tables, forms, dialogs, KPI cards
- Permission gates
- Loading / empty / error states
- Metadata-driven rendering (`GenericPage`)
- One API client and one error model

Implemented now:

- Login and session restore
- Dashboard (special screen)
- CRM Leads (hybrid/core worklist + form + view)
- Customer Master via `GenericPage` (metadata foundation)
- Navigation stubs for remaining modules

Not implemented yet (by design):

- Full AI Control Room
- Workflow designer
- Dynamic module builder
- Reporting engine
- Every ERP transaction screen

---

## 2. Libraries

Dependencies are kept minimal. A package is added only when React, MUI, or a small internal utility cannot solve the problem.

### Runtime

| Library | Role |
| --- | --- |
| **React 19** | UI runtime |
| **React DOM 19** | Browser renderer |
| **Vite 7** | Dev server and production bundler |
| **TypeScript 5.9** | Strict typing (`no any`, path alias `@/*`) |
| **MUI 7** + **Emotion** | Design system, layout, inputs, dialogs, a11y primitives |
| **@mui/icons-material** | Icon set used by chrome and actions |
| **Redux Toolkit** + **react-redux** | Global state: auth, tenant, permissions, UI chrome |
| **React Router 7** | Centralized routes, guards, lazy pages |
| **Axios** | HTTP client with interceptors |
| **TanStack Table** | Headless table engine (sort, selection, column defs) |
| **TanStack Virtual** | Optional row virtualization inside `DataTable` only |

### Tooling

| Library | Role |
| --- | --- |
| **ESLint 9** + typescript-eslint | Lint, no unused locals, no `any` |
| **Prettier** | Formatting |
| **@vitejs/plugin-react** | JSX / Fast Refresh |

### Intentionally not added

- Extra UI kits (no Ant, Chakra, Tailwind alongside MUI)
- Extra table kits (no AG Grid, no Material React Table)
- Extra state managers (no Zustand / MobX beside Redux)
- Form libraries (MUI fields + local state are enough for this phase)
- Date libraries / chart libraries (native date inputs; SVG bar chart)

---

## 3. Folder structure

```text
src/
├── main.tsx                 App bootstrap
├── index.css                Reset only — no theme colors
├── app/                     Composition root
│   ├── App.tsx              Bind HTTP auth + hydrate session
│   ├── providers.tsx        Redux + theme + router + toaster
│   ├── ThemeBridge.tsx      Rebuilds MUI theme from Redux mode
│   ├── routes.tsx           Route table (lazy pages)
│   ├── ProtectedRoute.tsx   Auth gate
│   ├── GuestRoute.tsx       Login-only gate
│   ├── AppToaster.tsx       Global snackbar
│   └── session.ts           Token binding + session restore
├── theme/                   Design tokens and MUI overrides
├── constants/               Routes, permissions, statuses, error codes
├── configurations/api/      Axios client, endpoints, error normalize
├── redux/                   Store + feature slices
├── models/                  API / domain TypeScript types
├── layouts/                 AppLayout, Sidebar, Topbar
├── components/              Reusable UI (no module business rules)
│   ├── common/
│   ├── cards/
│   ├── charts/
│   ├── tables/DataTable/
│   ├── forms/
│   └── metadata/            GenericPage renderer
├── pages/                   Screens + feature APIs + mock data
├── hooks/                   Shared hooks
└── utils/                   Formatters, validators, permission helpers
```

Rules:

- Pages do **not** call Axios.
- Pages do **not** embed API URLs or hex colors.
- Feature-specific mocks live next to the page (`dashboard.mock.ts`, `leads.mock.ts`).
- Shared types live in `models/`, not copied into each page.

---

## 4. Bootstrap flow

```text
index.html
  → main.tsx
    → AppProviders
         Redux store
         ThemeBridge (MUI theme from ui.themeMode)
         BrowserRouter
         AppToaster
    → App
         bindHttpAuth()     attach token accessors to Axios
          hydrateSession()   POST /auth/refresh when a refresh token is stored
         AppRoutes
```

`bindHttpAuth` is registered **after** the store exists so Axios never imports the store directly. That avoids a circular dependency between HTTP and Redux.

---

## 5. Theme and chrome

Theme tokens live in `src/theme/`.

- `palette.ts` — dark and light palettes, plus a `chrome` extension
- `typography.ts` — Inter, compact enterprise scale
- `components.ts` — MUI overrides that read the **active palette**
- `shadows.ts` — almost-flat elevation
- `createAppTheme(mode)` — factory used by `ThemeBridge`

### Light vs dark

Dark mode: navy shell throughout (sidebar, top bar, cards).

Light / white mode (matches the supplied leads screenshot):

- **Sidebar stays dark navy** with light labels
- **Top bar turns white**
- **Workspace is off-white** with white cards

Sidebar text cannot use `palette.text.*` in light mode (those become dark). Dedicated chrome tokens are used instead:

`chrome.sidebar`, `chrome.sidebarText`, `chrome.sidebarMuted`, `chrome.sidebarHover`, `chrome.sidebarBorder`, `chrome.appbar`

### Theme toggle

`ThemeToggle` in the top bar switches `ui.themeMode` (`dark` | `light`).

- Preference is stored in `localStorage` under `ierp.theme-mode`
- Moon icon in light mode, sun icon in dark mode

---

## 6. Routing

All path strings are defined in `src/constants/routes.ts`. Navigation and pages import `ROUTES` — they do not hardcode URLs.

Routes are declared once in `src/app/routes.tsx` and lazy-loaded.

| Path | Screen type | Implementation |
| --- | --- | --- |
| `/login` | Auth | `LoginPage` |
| `/dashboard` | Special | `DashboardPage` |
| `/crm/leads` | Hybrid worklist | `LeadsPage` |
| `/crm/leads/new` | Hybrid form | `LeadEditorPage` |
| `/crm/leads/:id` | Hybrid view | `LeadViewPage` |
| `/crm/leads/:id/edit` | Hybrid form | `LeadEditorPage` |
| `/masters/customers` | Hybrid / metadata | `GenericPage` |
| Other module paths | Placeholder | `ModulePlaceholder` |

Guards:

- `ProtectedRoute` — waits for session hydration, then requires `authenticated`
- `GuestRoute` — sends an already-authenticated user to the dashboard

Sidebar items come from `layouts/Sidebar/navigationConfig.ts` (label, icon, path, children, optional permission). The sidebar is configuration-driven, not hand-copied markup per module.

---

## 7. Authentication

Documented backend model:

1. Login returns a JWT access token.
2. Refresh token is returned in the response body and stored in `sessionStorage`.
3. Access token lifetime is 15 minutes.
4. Concurrent 401s share **one** refresh call (queue).
5. Failed refresh clears session and redirects to `/login`.

### Frontend implementation

`configurations/api/requestBuilder.ts`

- Request interceptor attaches `Authorization: Bearer <accessToken>`
- Login and refresh requests do not carry a Bearer token.
- Response interceptor:
  - ignores the refresh URL itself
  - on `401` / `TOKEN_EXPIRED`, runs a single in-flight refresh
  - retries the original request
  - on refresh failure, clears auth/tenant/permissions and sends the user to login

`redux/features/auth/`

- `status`: `idle` → `hydrating` → `authenticated` | `unauthenticated`
- Access token lives in Redux memory only
- Refresh tokens use the HttpOnly cookie supplied by the backend. When the backend
  returns a refresh token in the response body, it is stored only in `sessionStorage`.

---

## 8. API layer

```text
Page
  → Feature API  (pages/.../leadsApi.ts, dashboardApi.ts, metadataApi.ts)
    → Central client  (configurations/api)
      → Axios
        → ASP.NET Core  /  mock branch
```

### Central pieces

| File | Responsibility |
| --- | --- |
| `config.ts` | `API_BASE_URL`, `USE_MOCK`, `API_ENDPOINTS` |
| `requestBuilder.ts` | Axios instance, token, refresh queue, unwrap |
| `errorNormalizer.ts` | Axios / unknown → `NormalizedApiError` |
| `apiTypes.ts` | Re-exports envelope types |

### Response contract

Success:

```json
{ "success": true, "data": {}, "message": "Operation successful" }
```

Error:

```json
{ "success": false, "error": "VALIDATION_ERROR", "message": "Customer is required", "field": "customerId" }
```

Paginated list:

```json
{
  "success": true,
  "data": [],
  "pagination": { "page": 1, "pageSize": 20, "total": 245, "totalPages": 13 }
}
```

List queries use `?page=&pageSize=&search=&sortBy=&sortDir=` plus optional filters (`status`, etc.).

### Error codes

Mapped in `constants/errorCodes.ts` (validation, posting, stock, auth, tenant, AI, workflow, not found). UI messages come from this map — pages do not show a generic “Something went wrong” for every failure.

Field-level errors use `error.field` when the API sends it.

---

## 9. Redux

Redux holds **shared application state only**.

| Slice | Contents |
| --- | --- |
| `auth` | User, access token, session status |
| `tenant` | Tenant id/name, HQ node label |
| `permissions` | Roles, permission keys, denied fields |
| `ui` | Sidebar collapse, mobile drawer, theme mode, toast |

Not in Redux:

- Modal open/close
- Form drafts
- Table page / search / sort
- Local filters

Typed hooks: `useAppDispatch()`, `useAppSelector()`. Untyped `useDispatch` / `useSelector` are not used.

---

## 10. Permissions

Frontend permissions hide or disable UI. **The API remains the source of truth.**

Keys follow `module.resource.action`, defined in `constants/permissions.ts`.

```tsx
<PermissionGate permission="crm.leads.create">
  <CreateButton />
</PermissionGate>
```

`hasPermission()` treats `*` as superuser. Navigation items can declare a `permission` so unauthorized modules never appear.

Field-level denials live in `permissions.deniedFields` and are applied by `GenericPage` / `MetadataFieldRenderer`.

---

## 11. Tables

`components/tables/DataTable` is the only table abstraction.

Engine: **TanStack Table + MUI**.

Supported:

- Column definitions from the page
- Server-side pagination, sorting, filtering
- Row selection
- Row actions (view / edit / delete / print)
- Loading skeleton, empty state, error + retry
- Optional virtualization when `enableVirtualization` is true or row count ≥ `virtualizeThreshold` (default 80)

Pages never import TanStack Virtual. Virtualization stays inside `DataTable`.

Table query state is owned by `useTableState` (local, debounced search). That matches ERP worklists: filters die when the user leaves the screen.

---

## 12. Forms and reusable components

Presentational fields (`TextFieldControl`, `SelectField`, `BooleanField`, `FormSection`) contain no business rules.

Common building blocks:

| Component | Use |
| --- | --- |
| `PageHeader` | Title, eyebrow, badge, actions |
| `KpiCard` | Metric + optional trend |
| `StatusChip` | New / Qualified / Paid / etc. |
| `SearchInput` | Debounced worklist search |
| `FilterPanel` | Popover filters |
| `ConfirmDialog` | Destructive confirms |
| `LoadingState` / `EmptyState` / `ErrorState` | Explicit screen states |
| `PermissionGate` | UI authorization |
| `ActionMenu` | Overflow row actions |
| `BarChart` | Dashboard commercial performance (SVG, no chart lib) |

Every API-driven screen is expected to handle **loading, success, empty, error**.

---

## 13. Metadata / GenericPage

Process-flow rule: screens are Core, Hybrid, Dynamic, or Special.

`GenericPage` is the renderer for metadata-driven (and hybrid custom-field) screens.

```text
GET /api/v1/metadata/screens/{screenCode}
  → Screen + layout + sections + fields + actions
  → merge custom fields where entity_name == screen code
  → MetadataSectionRenderer
      → MetadataFieldRenderer
          → fieldRendererMap[controlType]
```

`fieldRendererMap` registers controls (`text`, `number`, `date`, `boolean`, `select`, `lookup`, `textarea`). New types are added to the map — not to a growing switch inside `GenericPage`.

Custom fields are usually merged by the backend. The client still merges as a safety net so a missing join cannot drop tenant extensions. Core table structures are never altered on the frontend.

Customer Master (`/masters/customers`) is the first live consumer, using mock metadata until the Metadata Engine is connected.

Leads stay a **hybrid/core screen** with a fixed worklist and form. They are not forced through `GenericPage`.

---

## 14. Feature APIs and mock data

`VITE_USE_MOCK` (default `true`) switches each feature API between local data and Axios.

| Feature | Service | Mock |
| --- | --- | --- |
| Auth | `redux/features/auth/authSlice.ts` | `configurations/api/authApi.ts` |
| Dashboard | `pages/Dashboard/dashboardApi.ts` | `pages/Dashboard/dashboard.mock.ts` |
| Leads | `pages/CRM/Leads/leadsApi.ts` | `pages/CRM/Leads/leads.mock.ts` |
| Metadata | `components/metadata/metadataApi.ts` | `pages/Masters/customers.metadata.mock.ts` |

Mock list endpoints still apply search, sort, pagination, and status filters so the table contract is real.

To connect the real API:

1. Set `VITE_USE_MOCK=false`
2. Set `VITE_API_BASE_URL` to the ASP.NET origin
3. Keep the same feature API function signatures — pages should not change

---

## 15. Screen architecture (what exists)

### Dashboard (special)

KPI row, commercial performance chart, pending approvals, neural anomaly card, audit logs, executive intelligence, activity stream. Data is a snapshot object, not inlined in JSX.

### Leads (hybrid)

- KPI strip (total / qualified / disqualified / average score)
- Worklist with search, status filter, sort, selection, pagination
- Row actions: view, edit, delete, print (print is reserved)
- Create / edit form sections matching the capture screenshot
- View mode with a qualification stepper

### Customer Master (metadata)

Rendered entirely from screen metadata + one merged custom field (`project_code`) to prove the auto-render rule.

### Other modules

Registered in the sidebar so the shell can grow. They render `ModulePlaceholder` instead of fake CRUD screens.

---

## 16. Coding conventions

- **No `style={{ }}`**. Use MUI `sx`, theme tokens, or a CSS module only if necessary.
- **No magic colors** in pages. Use `palette` / `chrome`.
- **No magic API URLs**. Use `API_ENDPOINTS`.
- **No `any`**. Use `unknown` + type guards at boundaries.
- Comments explain **why** (refresh queue, custom-field merge, server-side paging), not what the next line does.
- Route strings and permission keys are centralized.
- `import type` for type-only imports (`verbatimModuleSyntax`).

---

## 17. How to add a new ERP screen

1. Add the path to `constants/routes.ts`.
2. Add a nav item in `navigationConfig.ts` (and a permission if needed).
3. If the screen is **special / core / hybrid with custom UI**:
   - Create `pages/<Module>/<Screen>/`
   - Add `<Screen>.mock.ts` and `<screen>Api.ts`
   - Reuse `PageHeader`, `DataTable`, `KpiCard`, form fields
4. If the screen is **metadata-driven**:
   - Point a route at `<GenericPage screenCode="your-screen-code" />`
   - Register mock metadata until `GET /api/v1/metadata/screens/{code}` exists
5. Register the lazy route in `app/routes.tsx`.
6. Do not copy table markup or invent a second API client.

---

## 18. Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5080` | API origin |
| `VITE_USE_MOCK` | `true` | Local mocks vs live Axios |

Scripts:

```bash
npm run dev       # Vite on http://localhost:5173
npm run build     # tsc -b && vite build
npm run preview   # serve dist
npm run lint
npm run format
```

---

## 19. Design references

Authoritative inputs used to build this foundation:

- `docs/i-ERP_ProcessFlow_v4.docx` — product architecture, screen types, API envelope, auth, metadata
- `docs/reference/dashboard.png` — dark management console
- `docs/reference/Screenshot 2026-08-16 185248.png` — dark leads worklist
- `docs/reference/Screenshot (538).png` — dark lead create form
- `docs/reference/leads.png` — light workspace + dark sidebar chrome

The visual system is the navy + electric-blue language from those shots, not a generic MUI dashboard template.
