import { protectedProcedure } from '$lib/axios';
import type { LikeReviewResponse } from '$lib/types/responses';

export const likeReview = async (slug: string) => {
	const response = await protectedProcedure.post<LikeReviewResponse>(`/review/${slug}/like`);

	if (response.status !== 200) {
		throw new Error(response.data.error || 'An error occurred while liking the review.');
	}

	return response.data;
};
