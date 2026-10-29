/// <reference types="vite/client" />

/**
 * Blocks access to undeclared env variables: without it `vite/client` adds a
 * fallback `[key: string]: any` index, so a typo in a variable name is
 * silently typed as `any`.
 */
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  /** API base URL, e.g. https://punkapi.dev/v3 */
  readonly VITE_API_BASE_URL: string
  /** App base path from the Vite config (`base`), e.g. `/` */
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
