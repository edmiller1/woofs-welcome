import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { get } from 'svelte/store';

interface AuthModalState {
	isOpen: boolean;
	redirectTo: string | null;
	mode: 'sign-in' | 'sign-up';
}

const initialState: AuthModalState = {
	isOpen: false,
	redirectTo: null,
	mode: 'sign-in'
};

export const authModal = writable<AuthModalState>(initialState);

export const authModalActions = {
	// Open the modal with resirect path
	open(mode: 'sign-in' | 'sign-up', redirectTo?: string) {
		if (!browser) return;

		const currentPath = redirectTo || window.location.pathname + window.location.search;

		authModal.update((state) => ({
			...state,
			isOpen: true,
			mode,
			redirectTo: currentPath
		}));
	},

	// Close the modal
	close() {
		authModal.update((state) => ({
			...state,
			isOpen: false
		}));
	},

	// witch between sign-in and sign-up modes
	switchMode(mode: 'sign-in' | 'sign-up') {
		authModal.update((state) => ({
			...state,
			mode
		}));
	},

	async handleSuccess() {
		const state = get(authModal);

		// Close modal first
		authModal.update((s) => ({ ...s, isOpen: false }));

		// Redirect to intended destination
		if (state.redirectTo && state.redirectTo !== '/sign-in') {
			window.location.href = state.redirectTo;
		} else {
			window.location.reload(); // Refresh to update auth state
		}
	}
};
