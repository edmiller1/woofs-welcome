import { redirect, type Load } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getUser } from '$lib/auth/guard';

export const load: Load = async ({ parent }) => {
	const user = await getUser();

	return {
		user
	};
};
