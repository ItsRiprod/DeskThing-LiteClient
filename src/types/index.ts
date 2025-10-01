/** Add any custom types here */

export type InitializedStore = {
  initialized: boolean
  init: () => Promise<void>
}