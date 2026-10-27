export type Commands = string[]

declare module 'claude-code' {
  interface PluginState {
    'bang-run': { commands: Commands }
  }
}
