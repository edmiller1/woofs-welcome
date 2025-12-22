import { protectedProcedure } from '$lib/axios';
import type { GetCityPlacesResponse } from '$lib/types/city';

export const getCityPlacesAndEvents = async (
	slug: string,
	filters: { placeSort?: string; eventSort?: string }
) => {
	const response = await protectedProcedure.get<GetCityPlacesResponse>(`city/${slug}/places`, {
		params: filters
	});

	return response.data;
};
