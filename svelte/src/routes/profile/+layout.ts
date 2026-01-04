import { getUser } from '$lib/auth/guard';
import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load = async ({ url }) => {
	const user = await getUser();
	if (browser) {
		if (!user) {
			const redirectTo = url.pathname;
			throw redirect(307, `/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
		}

		if (user.activeContext === 'business') {
			throw redirect(307, `/business/dashboard`);
		}
	}

	return {
		user
	};
};
