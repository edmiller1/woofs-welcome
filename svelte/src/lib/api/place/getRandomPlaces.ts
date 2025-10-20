import { publicProcedure } from '$lib/axios';
import type { GetRandomPlacesResponse } from '$lib/types/responses';

export const getRandomPlaces = async () => {
	const response = await publicProcedure.get<GetRandomPlacesResponse>('/place/list/random');

	return response.data;
};
