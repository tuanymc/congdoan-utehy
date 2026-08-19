/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL của apps/api, vd http://localhost:3000. Mặc định dùng khi không set. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
