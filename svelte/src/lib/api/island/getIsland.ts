import { publicProcedure } from '$lib/axios';
import type { GetIslandResponse } from '$lib/types/responses';

export const getIsland = async (slug: string) => {
	const response = await publicProcedure.get<GetIslandResponse>(`island/${slug}`);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
