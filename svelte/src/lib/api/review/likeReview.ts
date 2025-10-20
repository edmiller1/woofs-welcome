import { protectedProcedure } from '$lib/axios';
import type { LikeReviewResponse } from '$lib/types/responses';

export const likeReview = async (slug: string) => {
	const response = await protectedProcedure.post<LikeReviewResponse>(`/review/${slug}/like`);

	return response.data;
};
