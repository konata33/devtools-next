import type { AppRecord } from '@vue-devtools-next/schema'
import { getInstanceState } from '../core/component/state'
import { getComponentTree } from '../core/component/tree'
import { stringify } from '../shared'
import { emit } from './emit'
import { DevToolsEvents, callBuffer, on } from './on'

export { DevToolsEvents, callBuffer } from './on'
export * from './plugin'
export const api = {
  on,
  ...emit,
}

export class DevToolsPluginApi {
  public on: typeof on
  constructor() {
    this.on = on
  }

  getInstanceState(params: { instanceId: string }) {
    const result = getInstanceState(params)
    const componentInstance = result.instance
    const app = result.instance?.appContext.app
    const payload = {
      componentInstance,
      app,
      instanceData: result,
    }
    callBuffer(DevToolsEvents.COMPONENT_STATE_INSPECT, payload)
    return stringify(result)
  }

  getComponentTree(options: { appRecord?: AppRecord; instanceId?: string ;filterText?: string; maxDepth?: number; recursively?: boolean }) {
    return getComponentTree(options)
  }

  addTimelineEvent() {}
  getInspectorTree() {}
  sendInspectorTree() {}
  getInspectorState() {}
  sendInspectorState() {}
  addInspector() {}
  addTimelineLayer() {}
  notifyComponentUpdate() {}
  now() {}
  getSettings() {
    return {
      logStoreChanges: null,
    }
  }
}
