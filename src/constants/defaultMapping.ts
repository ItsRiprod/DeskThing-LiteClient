import { Action, EventMode, MappingProfile } from "@deskthing/types";

const defaultActions: Action[] = [
  {
    name: 'WheelSelect',
    id: 'wheel',
    icon: 'wheel',
    description: 'Opens the selection wheel',
    source: 'server',
    version: '0.9.1',
    version_code: 9.1,
    enabled: true
  },
  {
    name: 'Shuffle',
    id: 'shuffle',
    value: 'toggle',
    value_options: ['off', 'toggle', 'on'],
    value_instructions: 'Toggles the shuffle setting',
    description: 'Shuffles the song',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Rewind',
    id: 'rewind',
    value: 'rewind',
    value_options: ['rewind', 'stop'],
    value_instructions:
      'Determines if the song should skip to 0 and then skip to previous track or just skip to previous track',
    description: 'Rewinds the song',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'PlayPause',
    id: 'play',
    icon: 'play',
    description: 'Plays or Pauses the song',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Skip',
    id: 'skip',
    description: 'Skips the song',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Repeat',
    id: 'repeat',
    description: 'Toggles repeat',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Open Preference App',
    id: 'pref',
    value: '0',
    value_instructions: 'The index of the app to open',
    description: 'Opens the app at the index in the value',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Swap Apps',
    id: 'swap',
    value: '0',
    value_instructions: 'The index of the app to swap with the current app',
    description: 'Swaps the current app with the selected one',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Volume Down',
    id: 'voldown',
    value: '15',
    value_instructions: 'The amount of volume to change by',
    description: 'Turns the volume down',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Volume Up',
    id: 'volup',
    value: '15',
    value_instructions: 'The amount of volume to change by',
    description: 'Turns the volume up',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Open App',
    id: 'open',
    value: 'utility',
    value_instructions: 'The id of the app to open',
    description: 'Opens the app defined in the value',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Toggle appslist',
    id: 'appslist',
    value: 'toggle',
    value_options: ['hide', 'toggle', 'show'],
    value_instructions: 'How the button behaves',
    description: 'Toggles the apps list.',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Open Previous',
    id: 'swipel',
    description: 'Opens the app at the previous index',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Open Next',
    id: 'swiper',
    description: 'Opens the app at the next index',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Hidden Button',
    id: 'hidden',
    description: 'Hides the button. Has no action',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  },
  {
    name: 'Fullscreen',
    id: 'fullscreen',
    description: 'Toggles Fullscreen on most devices',
    source: 'server',
    version: '0.9.0',
    version_code: 9,
    enabled: true
  }
]


export const defaultMapping: MappingProfile = {
  profileId: 'default',
  keys: [],
  mapping: {
    Wheel1: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '0'
      }
    },
    Wheel2: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '1'
      }
    },
    Wheel3: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '2'
      }
    },
    Wheel4: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '3'
      }
    },
    Tray1: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '0'
      }
    },
    Tray2: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '1'
      }
    },
    Tray3: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '2'
      }
    },
    Tray4: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '3'
      }
    },
    Tray5: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '4'
      }
    },
    Tray6: {
      [EventMode.KeyDown]: {
        enabled: true,
        id: 'pref',
        source: 'server',
        value: '5'
      }
    },
    DynamicAction1: {
      [EventMode.KeyDown]: {
        id: 'shuffle',
        source: 'server',
        value: 'toggle',
        enabled: true
      }
    },
    DynamicAction2: {
      [EventMode.KeyDown]: {
        id: 'repeat',
        source: 'server',
        enabled: true
      }
    },
    DynamicAction3: {
      [EventMode.KeyDown]: {
        id: 'rewind',
        value: 'stop',
        source: 'server',
        enabled: true
      }
    },
    DynamicAction4: {
      [EventMode.KeyDown]: {
        id: 'hidden',
        source: 'server',
        enabled: true
      }
    },
    Action5: {
      [EventMode.KeyDown]: {
        id: 'hidden',
        source: 'server',
        enabled: true
      }
    },
    Action6: {
      [EventMode.KeyDown]: {
        id: 'play',
        source: 'server',
        enabled: true
      }
    },
    Action7: {
      [EventMode.KeyDown]: {
        id: 'skip',
        source: 'server',
        enabled: true
      }
    },
    Digit1: {
      [EventMode.PressShort]: {
        id: 'pref',
        source: 'server',
        value: '0',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'swap',
        source: 'server',
        value: '0',
        enabled: true
      }
    },
    Digit2: {
      [EventMode.PressShort]: {
        id: 'pref',
        source: 'server',
        value: '1',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'swap',
        source: 'server',
        value: '1',
        enabled: true
      }
    },
    Digit3: {
      [EventMode.PressShort]: {
        id: 'pref',
        source: 'server',
        value: '2',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'swap',
        source: 'server',
        value: '2',
        enabled: true
      }
    },
    Digit4: {
      [EventMode.PressShort]: {
        id: 'pref',
        source: 'server',
        value: '3',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'swap',
        source: 'server',
        value: '3',
        enabled: true
      }
    },
    KeyM: {
      [EventMode.PressShort]: {
        id: 'open',
        source: 'server',
        value: 'dashboard',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'open',
        value: 'utility',
        source: 'server',
        enabled: true
      }
    },
    Scroll: {
      [EventMode.ScrollRight]: {
        id: 'volUp',
        value: '15',
        source: 'server',
        enabled: true
      },
      [EventMode.ScrollUp]: {
        id: 'volUp',
        value: '15',
        source: 'server',
        enabled: true
      },
      [EventMode.ScrollLeft]: {
        id: 'volDown',
        value: '15',
        source: 'server',
        enabled: true
      },
      [EventMode.ScrollDown]: {
        id: 'volDown',
        value: '15',
        source: 'server',
        enabled: true
      }
    },
    Enter: {
      [EventMode.KeyDown]: {
        id: 'wheel',
        source: 'server',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'skip',
        source: 'server',
        enabled: true
      }
    },
    Escape: {
      [EventMode.PressShort]: {
        id: 'appslist',
        value: 'show',
        source: 'server',
        enabled: true
      },
      [EventMode.PressLong]: {
        id: 'appslist',
        value: 'hide',
        source: 'server',
        enabled: true
      }
    },
    Swipe: {
      [EventMode.SwipeUp]: {
        id: 'appslist',
        value: 'hide',
        source: 'server',
        enabled: true
      },
      [EventMode.SwipeDown]: {
        id: 'appslist',
        value: 'show',
        source: 'server',
        enabled: true
      },
      [EventMode.SwipeLeft]: {
        id: 'swipel',
        source: 'server',
        enabled: true
      },
      [EventMode.SwipeRight]: {
        id: 'swiper',
        source: 'server',
        enabled: true
      }
    }
  },
  actions: defaultActions
}

