import { getAdminUser } from '$lib/auth/guard';
import { redirect, type Load } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load: Load = async () => {
	const user = await getAdminUser();

	if (browser) {
		if (!user) {
			throw redirect(302, '/');
		}
	}

	return {
		user
	};
};
