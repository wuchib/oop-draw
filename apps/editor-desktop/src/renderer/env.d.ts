import type { DesktopBridge } from '@oop-draw/platform';

declare global {
  interface Window {
    oopDrawDesktop: DesktopBridge;
  }
}

export {};
