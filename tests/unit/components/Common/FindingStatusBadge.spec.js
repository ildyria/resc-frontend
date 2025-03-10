import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import App from '@/components/Common/FindingStatusBadge.vue';
import Config from '@/configuration/config';

describe('FindingStatusBadge data-line tests', () => {
  let wrapper;

  const status_notAnalyzed = `${Config.value('notAnalyzedStatusVal')}`;
  const status_notAccessible = `${Config.value('notAccessibleStatusVal')}`;
  const status_clarificationRequired = `${Config.value('clarificationRequiredStatusVal')}`;
  const status_outdated = `${Config.value('outdatedStatusVal')}`;
  const status_truePositive = `${Config.value('truePostiveStatusVal')}`;
  const status_falsePositive = `${Config.value('falsePositiveStatusVal')}`;

  function initMountApp(status_type) {
    wrapper = mount(App, {
      components: {},
      props: {
        status: status_type,
      },
    });
  }

  beforeEach(() => {
    initMountApp(status_truePositive);
  });

  it('Given a FindingStatusBadge When status True positive is passed then True Positive badge will be displayed', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('True Positive');
  });

  it('Given a FindingStatusBadge When status Not Analyzed is passed then Not Analyzed badge will be displayed', () => {
    initMountApp(status_notAnalyzed);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('Not Analyzed');
  });

  it('Given a FindingStatusBadge When status Not Accessible is passed then Not Accessible badge will be displayed', () => {
    initMountApp(status_notAccessible);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('Not Accessible');
  });

  it('Given a FindingStatusBadge When status Outdated is passed then Outdated badge will be displayed', () => {
    initMountApp(status_outdated);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('Outdated');
  });

  it('Given a FindingStatusBadge When status Clarification Required is passed then Clarification Required badge will be displayed', () => {
    initMountApp(status_clarificationRequired);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('Clarification Required');
  });

  it('Given a FindingStatusBadge When status False Positive is passed then False Positive badge will be displayed', () => {
    initMountApp(status_falsePositive);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toContain('False Positive');
  });
});
