import { protectedProcedure, publicProcedure } from '$lib/axios';
import type { GetPlaceReviewsResponse } from '$lib/types/responses';

export const getPlaceReviews = async (slug: string, page: number) => {
	const response = await protectedProcedure.get<GetPlaceReviewsResponse>(`review/${slug}`, {
		params: { page }
	});

	return response.data;
};
