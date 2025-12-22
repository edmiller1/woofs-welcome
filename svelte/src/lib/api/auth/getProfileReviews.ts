import { protectedProcedure } from '$lib/axios';
import type { GetProfileReviewsResponse } from '$lib/types/user';

export const getProfileReviews = async (limit: number = 12, offset: number = 0) => {
	const response = await protectedProcedure.get<GetProfileReviewsResponse>(
		'/user/reviews/profile',
		{
			params: { limit, offset }
		}
	);

	return response.data;
};
