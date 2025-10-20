import { writable } from 'svelte/store';

type AuthModalMode = 'sign-in' | 'sign-up';
type AuthModalStep = 'email' | 'otp' | 'welcome';

interface AuthModalState {
	isOpen: boolean;
	mode: AuthModalMode;
	step: AuthModalStep;
	email?: string;
}

function createAuthModalStore() {
	const { subscribe, set, update } = writable<AuthModalState>({
		isOpen: false,
		mode: 'sign-in',
		step: 'email'
	});

	return {
		subscribe,
		open: (mode: AuthModalMode = 'sign-in') => {
			update((state) => ({
				...state,
				isOpen: true,
				mode,
				step: 'email' // Reset to email step
			}));
		},
		close: () => {
			set({
				isOpen: false,
				mode: 'sign-in',
				step: 'email',
				email: undefined
			});
		},
		switchMode: (mode: AuthModalMode) => {
			update((state) => ({
				...state,
				mode,
				step: 'email' // Reset step when switching mode
			}));
		},
		setStep: (step: AuthModalStep, email?: string) => {
			update((state) => ({
				...state,
				step,
				...(email && { email })
			}));
		},
		handleSuccess: async () => {
			// This will be called from the modal after successful auth
			set({
				isOpen: false,
				mode: 'sign-in',
				step: 'email',
				email: undefined
			});
		}
	};
}

export const authModal = createAuthModalStore();
export const authModalActions = authModal;
