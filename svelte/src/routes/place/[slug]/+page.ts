import { getUser } from '$lib/auth/guard';

export const load = async ({ params, url }) => {
	const user = await getUser();
	const { slug } = params;
	const searchParams = url.searchParams;

	return {
		user,
		slug,
		searchParams: Object.fromEntries(searchParams.entries())
	};
};
