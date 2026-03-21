import { defineStore } from 'pinia';

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    theme: 'light' as 'light' | 'dark',
  }),
});
