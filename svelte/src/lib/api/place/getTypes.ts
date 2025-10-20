import { publicProcedure } from '$lib/axios';

export const getTypes = async () => {
	const response = await publicProcedure.get<string[]>('/place/list/types');

	return response.data;
};
