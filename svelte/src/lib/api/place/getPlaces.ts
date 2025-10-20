import { publicProcedure } from '$lib/axios';

export const getPlaces = async () => {
	const response = await publicProcedure.get('/place');

	return response.data;
};
