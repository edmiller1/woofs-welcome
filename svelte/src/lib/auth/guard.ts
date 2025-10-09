import { redirect } from '@sveltejs/kit';
import { authClient } from './auth-client';

export async function requireAuth() {
	const { data } = await authClient.getSession();
	if (!data?.session) {
		throw redirect(302, '/sign-in');
	}
	return {
		session: data.session,
		user: data.user
	};
}

export async function requireGuest(): Promise<void> {
	const { data } = await authClient.getSession();
	if (data?.session) {
		throw redirect(302, '/');
	}
}

export async function getUser() {
	const { data } = await authClient.getSession();
	if (!data?.user) {
		return null;
	}
	return data.user;
}
