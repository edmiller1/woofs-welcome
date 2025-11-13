import { publicProcedure } from '$lib/axios';
import type { SearchLocationsResponse } from '$lib/types/responses';

export const searchLocations = async (query: string) => {
	const response = await publicProcedure.get<SearchLocationsResponse[]>(
		`/location/search?query=${query}`
	);

	return response.data;
};
