# i-ERP Frontend

Production-oriented React + Vite shell for **i-ERP — Intelligent Enterprise Platform**.

Full architecture, libraries, and runtime flows: [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md).

## Stack

React, Vite, TypeScript, MUI, Redux Toolkit, React Router, Axios, TanStack Table, TanStack Virtual.

## Run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — local development
- `npm run build` — type-check and production build
- `npm run preview` — serve the production build
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Configuration

Copy `.env.example` to `.env`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | ASP.NET Core API origin |
| `VITE_USE_MOCK` | Set to `true` only for non-auth feature mock data |
| `VITE_USE_DEV_HEADERS` | Keep `false` when using JWT authentication |

Use `VITE_API_BASE_URL=https://i-erp-backend-production.up.railway.app`,
`VITE_USE_MOCK=false`, and `VITE_USE_DEV_HEADERS=false` for the real backend.
Access tokens stay in memory. Refresh tokens use an HttpOnly cookie when provided
by the backend, or session storage when the backend returns a refresh token.

## What this foundation includes

- Dark enterprise shell matching the supplied dashboard/leads references
- Central API client with refresh-token queue
- Auth, tenant and permission state
- Reusable KPI, table, form, dialog and state components
- Dashboard and CRM Leads (list, create, edit, view)
- GenericPage metadata renderer with custom-field merge
