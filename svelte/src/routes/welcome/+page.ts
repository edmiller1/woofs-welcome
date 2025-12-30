import { getUser } from '$lib/auth/guard.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	const searchParams = url.searchParams;
	const user = await getUser();

	const isBusiness = url.searchParams.get('business') === 'true';

	if (!searchParams.has('email')) {
		throw redirect(303, '/sign-in');
	}

	if (!user) {
		if (isBusiness) {
			throw redirect(303, '/business?business=true');
		} else {
			throw redirect(303, '/sign-in');
		}
	}

	// If user already has name and avatar, they don't need this page
	if (user.name && user.image) {
		if (isBusiness) {
			// Has profile, send to business setup
			throw redirect(302, '/business/setup');
		} else {
			// Has profile, done with onboarding
			throw redirect(302, '/');
		}
	}

	return {
		user,
		searchParams: Object.fromEntries(searchParams.entries())
	};
};
