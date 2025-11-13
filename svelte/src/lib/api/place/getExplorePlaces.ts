import { protectedProcedure } from '$lib/axios';
import type { ExplorePlacesRequest } from '$lib/types/models';
import type { GetExplorePlacesResponse } from '$lib/types/responses';

export const getExplorePlaces = async (query: ExplorePlacesRequest) => {
	const response = await protectedProcedure.get<GetExplorePlacesResponse>('/place/explore', {
		params: query
	});

	return response.data;
};
