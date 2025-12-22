import { protectedProcedure } from '$lib/axios';
import type { GetIslandResponse } from '$lib/types/island';

export const getIsland = async (slug: string) => {
	const response = await protectedProcedure.get<GetIslandResponse>(`island/${slug}`);

	return response.data;
};
