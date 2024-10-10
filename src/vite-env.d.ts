/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_COLLECTION_ID: string
  readonly VITE_APPWRITE_HISTORY_DATABASE: string
  readonly VITE_APPWRITE_HISTORY_COLLECTION: string
  readonly VITE_APPWRITE_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}