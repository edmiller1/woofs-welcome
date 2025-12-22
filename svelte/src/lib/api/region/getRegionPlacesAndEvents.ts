import { protectedProcedure } from '$lib/axios';
import type { GetRegionplacesResponse } from '$lib/types/region';

export const getRegionPlacesAndEvents = async (
	slug: string,
	filters: { placeSort?: string; eventSort?: string }
) => {
	const response = await protectedProcedure.get<GetRegionplacesResponse>(`region/${slug}/places`, {
		params: filters
	});

	return response.data;
};
