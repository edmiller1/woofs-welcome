import { publicProcedure } from '$lib/axios';
import type { SearchLocationsresponse } from '$lib/types/types';

export const searchLocations = async (query: string) => {
	const response = await publicProcedure.get<SearchLocationsresponse[]>(
		`/location/search?query=${query}`
	);

	return response.data;
};
