import { protectedProcedure } from '$lib/axios';
import type { ProfileReviewResponse } from '$lib/types/responses';

export const getProfileReviews = async (limit: number = 12, offset: number = 0) => {
	const response = await protectedProcedure.get<ProfileReviewResponse>('/user/reviews/profile', {
		params: { limit, offset }
	});

	return response.data;
};
