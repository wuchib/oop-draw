<script setup lang="ts">
import { AppShell } from '@oop-draw/editor-shell';
import { createElectronPlatform } from '@oop-draw/platform';

const platform = createElectronPlatform(window.oopDrawDesktop);
</script>

<template>
  <AppShell :platform="platform" />
</template>
