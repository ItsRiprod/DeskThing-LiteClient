import { ClientConnectionMethod, ClientManifest, ClientPlatformIDs } from "@deskthing/types";

export const defaultManifest: ClientManifest = {
  name: '',
  id: '',
  short_name: '',
  description: '',
  context: {
    method: ClientConnectionMethod.Unknown,
    id: ClientPlatformIDs.Unknown,
    name: 'Unknown Connection Method',
    ip: '192.168.159.1',
    port: 8891
  },
  reactive: false,
  author: '',
  version: '0.11.0',
  compatibility: {
    server: '>=0.11.0',
    app: '>=0.10.0'
  },
  repository: ''
}