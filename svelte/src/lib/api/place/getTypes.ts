import { publicProcedure } from '$lib/axios';

export const getTypes = async () => {
	const response = await publicProcedure.get<string[]>('/place/list/types');

	if (response.status !== 200) {
		throw new Error('Failed to fetch place types');
	}

	return response.data;
};
