import { publicProcedure } from '$lib/axios';
import type { GetHomePlacesResponse } from '$lib/types/place';

export const getRandomPlaces = async () => {
	const response = await publicProcedure.get<GetHomePlacesResponse>('/place/list/random');

	return response.data;
};
