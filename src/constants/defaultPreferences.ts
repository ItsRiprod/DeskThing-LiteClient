import { ClientConfigurations, ViewMode, VolMode } from "@deskthing/types";

export const defaultPreferences: ClientConfigurations = {
  profileId: 'unset',
  version: '0.11.0',
  miniplayer: {
    state: ViewMode.PEEK,
    visible: true,
    position: 'bottom'
  },
  appTrayState: ViewMode.PEEK,
  theme: {
    scale: 'medium',
    primary: '#22c55e',
    textLight: '#ffffff',
    textDark: '#000000',
    icons: '#ffffff',
    background: '#000000'
  },
  volume: VolMode.WHEEL,
  currentView: {
    name: 'dashboard',
    enabled: true,
    running: true,
    timeStarted: 0,
    prefIndex: 0
  },
  ShowNotifications: true,
  Screensaver: {
    name: 'default',
    enabled: true,
    running: true,
    timeStarted: 0,
    prefIndex: 0
  },
  onboarding: false,
  showPullTabs: false,
  saveLocation: true,
  ScreensaverType: {
    version: '0',
    type: 'clock'
  },
  use24hour: false
}