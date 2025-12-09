import { protectedProcedure } from '$lib/axios';
import type { getIslandPlacesResponse, getRegionPlacesResponse } from '$lib/types/responses';

export const getRegionPlacesAndEvents = async (
	slug: string,
	filters: { placeSort?: string; eventSort?: string }
) => {
	const response = await protectedProcedure.get<getRegionPlacesResponse>(`island/${slug}/places`, {
		params: filters
	});

	return response.data;
};
