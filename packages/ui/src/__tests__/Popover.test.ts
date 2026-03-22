// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import Button from '../components/Button.vue';
import Popover from '../components/Popover.vue';

describe('Popover', () => {
  it('renders popover content when open', async () => {
    const wrapper = mount(Popover, {
      attachTo: document.body,
      props: {
        open: true,
      },
      slots: {
        default: '<p>Popover body</p>',
        trigger: '<Button>Toggle popover</Button>',
      },
      global: {
        components: {
          Button,
        },
      },
    });

    await nextTick();

    expect(document.body.textContent).toContain('Popover body');
    wrapper.unmount();
  });
});
