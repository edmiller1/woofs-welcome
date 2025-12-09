import { protectedProcedure } from '$lib/axios';
import type { getIslandPlacesResponse } from '$lib/types/responses';

export const getIslandPlacesAndEvents = async (
	slug: string,
	filters: { placeSort?: string; eventSort?: string }
) => {
	const response = await protectedProcedure.get<getIslandPlacesResponse>(`island/${slug}/places`, {
		params: filters
	});

	return response.data;
};
