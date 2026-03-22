// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import Dialog from '../components/Dialog.vue';
import Button from '../components/Button.vue';

describe('Dialog', () => {
  it('renders title, description, and content when open', async () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: {
        description: 'Manage export settings',
        open: true,
        title: 'Export canvas',
      },
      slots: {
        default: '<p>Dialog content</p>',
        trigger: '<Button>Open dialog</Button>',
      },
      global: {
        components: {
          Button,
        },
      },
    });

    await nextTick();

    expect(document.body.textContent).toContain('Export canvas');
    expect(document.body.textContent).toContain('Manage export settings');
    expect(document.body.textContent).toContain('Dialog content');
    wrapper.unmount();
  });
});
