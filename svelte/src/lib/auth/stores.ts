import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { authClient } from './auth-client';
import { sessionCache } from './session-cache';
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
	async checkAuth() {
		if (!browser) return;

		const session = await authClient.getSession();
		if (session && session.data) {
			return session.data.user;
		}
		return null;
	},

	async signIn(email: string) {
		const result = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
		return result;
	},

	async signUp(email: string) {
		const result = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: 'sign-in'
		});
		return result;
	},

	async verifyOtp(email: string, otp: string) {
		console.log('Auth store - verifyOtp called:', { email, otp });
		const result = await authClient.signIn.emailOtp({ email: email.trim(), otp: otp.trim() });

		console.log('Auth store - verifyOtp result:', result);

		if (result.data) {
			sessionCache.invalidate();
			const freshSession = await sessionCache.getSession();

			if (freshSession.data) {
				session.set(freshSession.data);
			}
		}
		return result;
	},

	async resendOTP(email: string, type: 'sign-in' | 'email-verification') {
		const result = await authClient.emailOtp.sendVerificationOtp({ email, type });

		return result;
	},

	async signOut() {
		await authClient.signOut();
		sessionCache.clear();
		session.set(null);
		window.location.reload();
	},

	async oAuthSignIn(provider: string, redirectTo: string) {
		const encodedRedirect = encodeURIComponent(redirectTo);

		const result = await authClient.signIn.social({
			provider,
			callbackURL: `http://localhost:5173/auth/callback?redirect=${encodedRedirect}`
		});
		return result;
	},

	async displayOneTap() {
		if (!browser) return;
		await authClient.oneTap({
			callbackURL: 'http://localhost:5173/auth/callback'
		});
	},

	async handleOAuthCallback(redirectTo: string) {
		if (!browser) return;

		try {
			const { data } = await sessionCache.getSession();
			if (data) {
				session.set(data);

				localStorage.removeItem('auth_redirect');
				goto(redirectTo);

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
			const { data } = await sessionCache.getSession();
			session.set(data || null);
		} catch (error) {
			console.error('Failed to initialize session:', error);
			session.set(null);
		} finally {
			loading.set(false);
		}
	},

	async refresh() {
		if (!browser) return;

		try {
			sessionCache.invalidate();
			const { data } = await sessionCache.getSession();
			session.set(data || null);
		} catch (error) {
			console.error('Failed to refresh session:', error);
			session.set(null);
		}
	}
};
