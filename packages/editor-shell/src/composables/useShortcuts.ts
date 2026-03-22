import { onMounted, onUnmounted } from 'vue';

interface ShortcutHandlers {
  onSave: () => void;
  onOpen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function useShortcuts(handlers: ShortcutHandlers): void {
  const handleKeydown = (event: KeyboardEvent) => {
    const isModifier = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();

    if (isModifier && key === 's') {
      event.preventDefault();
      handlers.onSave();
    }

    if (isModifier && key === 'o') {
      event.preventDefault();
      handlers.onOpen();
    }

    if (isModifier && (key === '=' || key === '+')) {
      event.preventDefault();
      handlers.onZoomIn();
    }

    if (isModifier && key === '-') {
      event.preventDefault();
      handlers.onZoomOut();
    }

    if (isModifier && key === '0') {
      event.preventDefault();
      handlers.onResetZoom();
    }
  };

  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
}
