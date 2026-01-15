import { browser } from '$app/environment';
import { api } from '$lib/api';
import { redirect, type Load } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getUser } from '$lib/auth/guard';

export const load: Load = async () => {
	const user = await getUser();

	if (browser) {
		if (!user) {
			throw redirect(302, '/sign-in?business=true');
		}

		if (!user.business) {
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
