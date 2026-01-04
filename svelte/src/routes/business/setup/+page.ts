import { browser } from '$app/environment';
import { getUser } from '$lib/auth/guard';
import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async () => {
	const user = await getUser();

	if (browser) {
		if (!user) {
			throw redirect(302, '/sign-in?business=true');
		}

		if (user.business) {
			throw redirect(302, '/business/dashboard');
		}
	}

	return {
		user
	};
};
