import { getUser } from '$lib/auth/guard';
import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async () => {
	const user = await getUser();

	if (!user) {
		throw redirect(302, '/sign-in?business=true');
	}

	return {
		user
	};
};
