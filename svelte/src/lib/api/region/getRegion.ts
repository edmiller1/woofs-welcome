import { publicProcedure } from '$lib/axios';
import type { GetRegionResponse } from '$lib/types/responses';

export const getRegion = async (region: string) => {
	const response = await publicProcedure.get<GetRegionResponse>(`/region/${region}`);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
