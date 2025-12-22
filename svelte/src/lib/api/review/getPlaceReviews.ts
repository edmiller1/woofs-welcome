import { protectedProcedure } from '$lib/axios';
import type { GetPlaceReviewsResponse } from '$lib/types/place';

export const getPlaceReviews = async (slug: string, page: number) => {
	const response = await protectedProcedure.get<GetPlaceReviewsResponse>(`review/${slug}`, {
		params: { page }
	});

	return response.data;
};
