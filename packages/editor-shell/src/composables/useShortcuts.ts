import { onMounted, onUnmounted } from 'vue';

export function useShortcuts(onSave: () => void, onOpen: () => void): void {
  const handleKeydown = (event: KeyboardEvent) => {
    const isModifier = event.metaKey || event.ctrlKey;

    if (!isModifier) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 's') {
      event.preventDefault();
      onSave();
    }

    if (key === 'o') {
      event.preventDefault();
      onOpen();
    }
  };

  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
}
