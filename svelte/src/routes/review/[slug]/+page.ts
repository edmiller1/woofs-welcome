import { getUser, requireAuth } from '$lib/auth/guard';

export const load = async ({ params }) => {
	const user = await getUser();
	const { slug } = params;

	return {
		user,
		slug
	};
};
