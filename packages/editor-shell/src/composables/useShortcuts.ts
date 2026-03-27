import type { ToolId } from '@oop-draw/shared';
import { onMounted, onUnmounted } from 'vue';

interface ShortcutHandlers {
  onSave: () => void;
  onOpen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSelectTool: (tool: ToolId) => void;
  onDeleteSelection: () => void;
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

    if (!isModifier && key === 'v') {
      event.preventDefault();
      handlers.onSelectTool('select');
    }

    if (!isModifier && key === 'h') {
      event.preventDefault();
      handlers.onSelectTool('hand');
    }

    if (!isModifier && key === 'r') {
      event.preventDefault();
      handlers.onSelectTool('rectangle');
    }

    if (!isModifier && key === 'o') {
      event.preventDefault();
      handlers.onSelectTool('ellipse');
    }

    if (!isModifier && key === 'a') {
      event.preventDefault();
      handlers.onSelectTool('arrow');
    }

    if (!isModifier && (key === 'delete' || key === 'backspace')) {
      event.preventDefault();
      handlers.onDeleteSelection();
    }
  };

  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
}
