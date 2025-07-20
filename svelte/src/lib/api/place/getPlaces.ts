import { publicProcedure } from '$lib/axios';

export const getPlaces = async () => {
	const response = await publicProcedure.get('/place');

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
