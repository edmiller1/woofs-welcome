import { protectedProcedure } from '$lib/axios';
import type { GetIslandPlacesResponse } from '$lib/types/island';

export const getIslandPlacesAndEvents = async (
	slug: string,
	filters: { placeSort?: string; eventSort?: string }
) => {
	const response = await protectedProcedure.get<GetIslandPlacesResponse>(`island/${slug}/places`, {
		params: filters
	});

	return response.data;
};
