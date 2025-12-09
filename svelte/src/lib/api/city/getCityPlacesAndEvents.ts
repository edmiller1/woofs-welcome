import { protectedProcedure } from '$lib/axios';
import type { getCityPlacesResponse } from '$lib/types/responses';

export const getCityPlacesAndEvents = async (
	slug: string,
	filters: { placeSort?: string; eventSort?: string }
) => {
	const response = await protectedProcedure.get<getCityPlacesResponse>(`city/${slug}/places`, {
		params: filters
	});

	return response.data;
};
