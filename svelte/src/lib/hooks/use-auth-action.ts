import { get } from 'svelte/store';
import { authModalActions } from '$lib/auth/auth-modal-store';
import { isAuthenticated } from '$lib/auth/stores';

export const useAuthAction = () => {
	return {
		requireAuth<T extends any[]>(action: (...args: T) => void | Promise<void>) {
			return async (...args: T) => {
				if (get(isAuthenticated)) {
					return action(...args);
				} else {
					authModalActions.open('sign-in');
				}
			};
		},

		checkAuthOrPrompt(): boolean {
			if (get(isAuthenticated)) {
				return true;
			}
			authModalActions.open('sign-in');
			return false;
		}
	};
};
