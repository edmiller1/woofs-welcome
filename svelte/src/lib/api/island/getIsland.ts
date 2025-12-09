import { protectedProcedure } from '$lib/axios';
import type { GetIslandResponse } from '$lib/types/responses';

export const getIsland = async (slug: string) => {
	const response = await protectedProcedure.get<GetIslandResponse>(`island/${slug}`);

	return response.data;
};
