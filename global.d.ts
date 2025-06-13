import { ClientManifest } from "@deskthing/types"

declare global {
  interface Window {
    manifest?: ClientManifest
  }
}
