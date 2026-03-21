import type { PlatformServices } from '@oop-draw/shared';
import type { DesktopBridge } from './electron-bridge';

export function createElectronPlatform(bridge: DesktopBridge): PlatformServices {
  return {
    kind: 'desktop',
    openDocument: bridge.openDocument,
    saveDocument: bridge.saveDocument,
    openExternal: bridge.openExternal,
    notify: bridge.notify,
  };
}
