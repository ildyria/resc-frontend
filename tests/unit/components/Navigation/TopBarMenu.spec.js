import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import App from '@/components/Navigation/TopBarMenu.vue';
import { useAuthUserStore } from '@/store';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createRouter, createWebHistory } from 'vue-router';
import Config from '@/configuration/config';
import { importFA } from '@/assets/font-awesome';
import { createTestingPinia } from '@pinia/testing';
import flushPromises from 'flush-promises';

importFA();

describe('TopBarMenu.vue unit tests', () => {
  it('Given TopBarMenu template structure check', async () => {
    let wrapper;
    const router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes: [],
    });

    // We force config so we can actually use the v-if in the element...
    vi.spyOn(Config, 'value').mockImplementation(() => true);

    wrapper = mount(App, {
      global: {
        router,
        components: {
          FontAwesomeIcon,
        },
        plugins: [
          createTestingPinia({
            stubActions: false,
            initialState: {
              authUser: {
                idToken: '12345',
                accessToken: '12345',
                destinationRoute: 'resc',
                firstName: 'user',
                lastName: 'test',
                email: 'testuser@test.com',
              },
            },
          }),
        ],
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm.userFullName).toBe('user test');
    expect(wrapper.vm.userEmail).toBe('testuser@test.com');
    expect(wrapper.vm.avatarText).toBe('ut');
    wrapper.vm.logout();
    await wrapper.vm.$nextTick();
    const store = useAuthUserStore();
    expect(store.idToken).toBe(null);
    expect(store.accessToken).toBe(null);
    expect(store.destinationRoute).toBe(null);
    expect(store.firstName).toBe(null);
    expect(store.lastName).toBe(null);
    expect(store.email).toBe(null);
    await flushPromises();
    expect(store.destinationRoute).toBe('/');
  });
});
