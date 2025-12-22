import { protectedProcedure } from '$lib/axios';
import type { LikeReviewResponse } from '$lib/types/review';

export const likeReview = async (slug: string) => {
	const response = await protectedProcedure.post<LikeReviewResponse>(`/review/${slug}/like`);

	return response.data;
};
