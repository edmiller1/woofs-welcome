import { getBusinessUser } from '$lib/auth/guard';
import { redirect, type Load } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load: Load = async () => {
	const user = await getBusinessUser();

	if (browser) {
		if (!user) {
			throw redirect(302, '/sign-in?business=true');
		}

		if (user.activeContext === 'personal') {
			throw redirect(302, '/profile');
		}
	}

	return {
		user
	};
};
