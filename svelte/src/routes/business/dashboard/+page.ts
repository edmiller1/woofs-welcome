import { requireBusinessUser } from '$lib/auth/guard';
import type { Load } from '@sveltejs/kit';

export const load: Load = async () => {
	const user = await requireBusinessUser();

	return {
		user
	};
};
