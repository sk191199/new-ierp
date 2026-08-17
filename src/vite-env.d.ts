/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK: string;
  readonly VITE_USE_MOCK_LEADS: string;
  readonly VITE_USE_DEV_HEADERS: string;
  readonly VITE_DEV_TENANT_ID: string;
  readonly VITE_DEV_USER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
