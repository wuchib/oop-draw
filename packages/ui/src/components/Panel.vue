<template>
  <section class="panel">
    <slot />
  </section>
</template>

<style scoped>
.panel {
  border: 1px solid var(--od-color-border);
  background: var(--od-color-panel);
  border-radius: 12px;
  padding: 1rem;
}
</style>
