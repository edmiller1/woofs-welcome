import { protectedProcedure } from '$lib/axios';
import type { ReviewFormData } from '$lib/schemas';
import type { CreateReviewResponse } from '$lib/types/responses';

export const createReview = async (data: ReviewFormData) => {
	const response = await protectedProcedure.post<CreateReviewResponse>(`/review/create`, data);

	return response.data;
};
