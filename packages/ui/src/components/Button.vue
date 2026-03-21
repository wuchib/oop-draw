<template>
  <button class="button" type="button">
    <slot />
  </button>
</template>

<style scoped>
.button {
  border: 1px solid var(--od-color-border);
  background: var(--od-color-surface);
  color: var(--od-color-text);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.button:hover {
  background: var(--od-color-surface-muted);
}
</style>
