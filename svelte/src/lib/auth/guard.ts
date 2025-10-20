import { redirect } from '@sveltejs/kit';
import { sessionCache } from './session-cache';

export async function requireAuth() {
	const { data } = await sessionCache.getSession();
	if (!data?.session) {
		throw redirect(302, '/sign-in');
	}
	return {
		session: data.session,
		user: data.user
	};
}

export async function requireGuest(): Promise<void> {
	const { data } = await sessionCache.getSession();
	if (data?.session) {
		throw redirect(302, '/');
	}
}

export async function getUser() {
	const { data } = await sessionCache.getSession();
	if (!data?.user) {
		return null;
	}
	return data.user;
}
