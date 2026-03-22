// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Button from '../components/Button.vue';

describe('Button', () => {
  it('renders variant and size classes', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'lg',
        variant: 'primary',
      },
      slots: {
        default: 'Create shape',
      },
    });

    expect(wrapper.text()).toContain('Create shape');
    expect(wrapper.classes().some((value) => value.includes('bg-accent'))).toBe(true);
    expect(wrapper.classes()).toContain('h-11');
  });
});
