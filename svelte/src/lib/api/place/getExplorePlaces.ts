import { protectedProcedure } from '$lib/axios';
import type { ExplorePlacesRequest, GetExplorePlacesResponse } from '$lib/types/place';

export const getExplorePlaces = async (query: ExplorePlacesRequest) => {
	// Filter out undefined, null, empty strings, and false booleans
	const cleanParams = Object.entries(query).reduce(
		(acc, [key, value]) => {
			if (value === undefined || value === null || value === '' || value === false) {
				return acc;
			}

			acc[key] = value;
			return acc;
		},
		{} as Record<string, any>
	);

	const response = await protectedProcedure.get<GetExplorePlacesResponse>('/place/explore', {
		params: cleanParams
	});

	return response.data;
};
