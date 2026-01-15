import { page } from '$app/state';
import { switchContext } from '$lib/api/auth/switchContext';
import type { Context } from '$lib/types/types';
import { writable, derived } from 'svelte/store';

function createContextStore() {
	const { subscribe, set } = writable<Context>('personal');

	return {
		subscribe,
		set,
		toggle: async () => {
			// Get current context from store
			let currentContext: Context = 'personal';
			subscribe((val) => (currentContext = val))();

			const newContext: Context = currentContext === 'personal' ? 'business' : 'personal';

			// Update server
			const response = await switchContext(newContext);

			if (response.success) {
				set(newContext);

				// Redirect to appropriate homepage
				if (newContext === 'business' && page.url.pathname.includes('/profile')) {
					window.location.href = '/business/dashboard';
				} else {
					window.location.reload();
				}
			}
		},
		setContext: async (context: Context) => {
			// Update server
			const response = await switchContext(context);

			if (response.success) {
				set(context);
				window.location.reload();
			}
		}
	};
}

export const contextStore = createContextStore();

// Derived store to check if in business context
export const isBusinessContext = derived(contextStore, ($context) => $context === 'business');
