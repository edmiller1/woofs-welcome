import { redirect } from '@sveltejs/kit';
import { sessionCache } from './session-cache';
import type { BAUser } from '$lib/types/user';

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
	const session = await sessionCache.getSession();
	if (!session.data) {
		return null;
	}
	return session.data.user as BAUser;
}

export async function getBusinessUser() {
	const session = await sessionCache.getSession();

	if (!session.data) {
		return null;
	}

	const user = session.data.user as BAUser;

	if (!user.isBusinessAccount) {
		redirect(302, '/');
	}

	return user;
}
