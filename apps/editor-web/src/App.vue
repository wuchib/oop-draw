<script setup lang="ts">
import { AppShell } from '@oop-draw/editor-shell';
import { createWebPlatform } from '@oop-draw/platform';

const platform = createWebPlatform();
</script>

<template>
  <AppShell :platform="platform" />
</template>
