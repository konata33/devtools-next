import type { App } from 'vue'
import type { AppRecord, PluginDescriptor, PluginSetupFunction, VueAppInstance } from './app'

type HookAppInstance = App & VueAppInstance
export enum DevToolsHooks {
  // internal
  APP_INIT = 'app:init',
  APP_UNMOUNT = 'app:unmount',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
  PERFORMANCE_START = 'perf:start',
  PERFORMANCE_END = 'perf:end',
  ADD_ROUTE = 'router:add-route',
  REMOVE_ROUTE = 'router:remove-route',
  RENDER_TRACKED = 'render:tracked',
  RENDER_TRIGGERED = 'render:triggered',
  APP_CONNECTED = 'app:connected',
  SETUP_DEVTOOLS_PLUGIN = 'devtools-plugin:setup',
}

export interface DevToolsEvent {
  [DevToolsHooks.APP_INIT]: (app: VueAppInstance['appContext']['app'], version: string) => void
  [DevToolsHooks.APP_CONNECTED]: () => void
  [DevToolsHooks.COMPONENT_ADDED]: (app: HookAppInstance, uid: number, parentUid: number, component: VueAppInstance) => void
  [DevToolsHooks.COMPONENT_UPDATED]: DevToolsEvent['component:added']
  [DevToolsHooks.COMPONENT_REMOVED]: DevToolsEvent['component:added']
  [DevToolsHooks.SETUP_DEVTOOLS_PLUGIN]: (pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction) => void
}

export interface DevToolsHook {
  id: string
  enabled?: boolean
  events: Map<DevToolsHooks, Function[]>
  emit: (event: DevToolsHooks, ...payload: any[]) => void
  on: <T extends Function>(event: DevToolsHooks, handler: T) => () => void
  once: <T extends Function>(event: DevToolsHooks, handler: T) => void
  off: <T extends Function>(event: DevToolsHooks, handler: T) => void
  appRecords: AppRecord[]
  apps: Record<number, { componentCount: number }>
  cleanupBuffer?: (matchArg: unknown) => boolean
}

export interface VueHooks {
  on: {
    vueAppInit(fn: DevToolsEvent[DevToolsHooks.APP_INIT]): void
    vueAppConnected(fn: DevToolsEvent[DevToolsHooks.APP_CONNECTED]): void
    componentAdded(fn: DevToolsEvent[DevToolsHooks.COMPONENT_ADDED]): () => void
    componentUpdated(fn: DevToolsEvent[DevToolsHooks.COMPONENT_UPDATED]): () => void
    componentRemoved(fn: DevToolsEvent[DevToolsHooks.COMPONENT_REMOVED]): () => void
    setupDevtoolsPlugin(fn: DevToolsEvent[DevToolsHooks.SETUP_DEVTOOLS_PLUGIN]): void
  }
  setupDevToolsPlugin(pluginDescriptor: PluginDescriptor, setupFn: PluginSetupFunction): void
}
