import { publicProcedure } from '$lib/axios';
import type { GetRandomPlacesResponse } from '$lib/types/responses';

export const getRandomPlaces = async () => {
	const response = await publicProcedure.get<GetRandomPlacesResponse>('/place/list/random');

	if (response.status !== 200) {
		throw new Error('Failed to fetch random places');
	}

	return response.data;
};
