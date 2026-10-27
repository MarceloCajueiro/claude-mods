export type Options = readonly string[]

declare module 'claude-code' {
  interface PluginState {
    'quick-options': { options: Options }
  }
}
