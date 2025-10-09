import { getUser } from '$lib/auth/guard.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	const searchParams = url.searchParams;
	const user = await getUser();

	if (!searchParams.has('email')) {
		throw redirect(303, '/sign-in');
	}

	return {
		user,
		searchParams: Object.fromEntries(searchParams.entries())
	};
};
