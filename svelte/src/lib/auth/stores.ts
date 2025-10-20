// src/lib/auth/stores.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { authClient } from './auth-client';
import type { Session } from './auth-client';
import { goto } from '$app/navigation';

// Auth state
export const session = writable<Session | null>(null);
export const loading = writable(true);

// Derived stores
export const user = derived(session, ($session) => $session?.user ?? null);
export const isAuthenticated = derived(session, ($session) => !!$session);

export const needsProfileCompletion = derived(user, ($user) => {
	if (!$user) return false;
	return !$user.name || $user.name === $user.email || $user.name === '';
});

export const auth = {
	async signIn(email: string) {
		const result = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
		return result;
	},

	async signUp(email: string) {
		const result = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: 'email-verification'
		});
		return result;
	},

	async verifyOtp(email: string, otp: string) {
		const result = await authClient.signIn.emailOtp({ email, otp });
		if (result.data) {
			//@ts-ignore
			session.set(result.data);
		}
		return result;
	},

	async resendOTP(email: string, type: 'sign-in' | 'email-verification') {
		const result = await authClient.emailOtp.sendVerificationOtp({ email, type });

		return result;
	},

	async signOut() {
		await authClient.signOut();
		session.set(null);
		window.location.reload();
	},

	async oAuthSignIn(provider: string) {
		// Use the Better Auth client method instead of manual redirect
		const result = await authClient.signIn.social({
			provider,
			callbackURL: 'http://localhost:5173/auth/callback' // Your SvelteKit callback
		});
		return result;
	},

	async displayOneTap() {
		if (!browser) return;
		await authClient.oneTap({
			callbackURL: 'http://localhost:5173/auth/callback' // Your SvelteKit callback
		});
	},

	async handleOAuthCallback() {
		if (!browser) return;

		try {
			const { data } = await authClient.getSession();
			if (data) {
				session.set(data);

				const redirectPath = localStorage.getItem('auth_redirect') || '/';
				localStorage.removeItem('auth_redirect');
				goto(redirectPath);

				return true;
			}
		} catch (error) {
			console.error('OAuth callback error:', error);
			throw error;
		}

		return false;
	},

	async initialize() {
		if (!browser) return;

		loading.set(true);
		try {
			const { data } = await authClient.getSession();
			session.set(data || null);
		} catch (error) {
			console.error('Failed to initialize session:', error);
			session.set(null);
		} finally {
			loading.set(false);
		}
	}
};
