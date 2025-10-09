import { publicProcedure } from '$lib/axios';
import type { GetPlaceReviewStatsResponse } from '$lib/types/responses';

export const getReviewStats = async (slug: string) => {
	const response = await publicProcedure.get<GetPlaceReviewStatsResponse>(`review/${slug}/stats`);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
