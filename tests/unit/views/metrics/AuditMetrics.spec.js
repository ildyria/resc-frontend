import { shallowMount } from '@vue/test-utils';
import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import App from '@/views/metrics/AuditMetrics.vue';
import audit_count_by_auditor_per_week from '@/../tests/resources/mock_audit_count_by_auditor_per_week.json';

vi.mock('axios');

describe('AuditMetrics tests', () => {
  it('Given a AuditMetrics When props are passed then AuditMetrics will be displayed', () => {
    axios.get.mockResolvedValueOnce({ data: audit_count_by_auditor_per_week });
    const wrapper = shallowMount(App, {
      props: {},
      components: {},
    });

    expect(wrapper.exists()).toBe(true);
  });
});
