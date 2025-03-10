import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from '@/components/Filters/RuleTagsFilter.vue';
import flushPromises from 'flush-promises';

describe('RuleTagsFilter tests', () => {
  it('Given a RuleTagsFilter When props are passed then RuleTagsFilter will be displayed', () => {
    const wrapper = mount(App, {
      props: {
        ruleTagsOptions: ['tag1', 'tag2'],
      },
      components: {},
    });

    expect(wrapper.exists()).toBe(true);
    expect(() => wrapper.vm.onRuleTagFilterChange()).not.toThrow();
    expect(wrapper.emitted()).toHaveProperty('on-rule-tags-change');
    expect(() => wrapper.vm.resetRuleTagsFilterSelection()).not.toThrow();
  });

  it('Given a RuleTagsFilter When props are passed then RuleTagsFilter will be displayed', async () => {
    const wrapper = mount(App, {
      props: {
        ruleTagsOptions: ['tag1', 'tag2'],
        ruleTagsSelected: ['tag1'],
      },
      components: {},
    });

    expect(wrapper.exists()).toBe(true);
    wrapper.setProps({ ruleTagsSelected: ['tag1'] });
    await flushPromises();
    expect(() => wrapper.vm.onRuleTagFilterChange()).not.toThrow();
    expect(wrapper.emitted()).toHaveProperty('on-rule-tags-change');
    expect(() => wrapper.vm.resetRuleTagsFilterSelection()).not.toThrow();
  });
});
