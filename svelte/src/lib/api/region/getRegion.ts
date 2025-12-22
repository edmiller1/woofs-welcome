import { protectedProcedure } from '$lib/axios';
import type { GetRegionResponse } from '$lib/types/region';

export const getRegion = async (region: string) => {
	const response = await protectedProcedure.get<GetRegionResponse>(`/region/${region}`);

	return response.data;
};
