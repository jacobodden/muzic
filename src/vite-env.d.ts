/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MUZIC_YT_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  onYouTubeIframeAPIReady?: () => void
}
