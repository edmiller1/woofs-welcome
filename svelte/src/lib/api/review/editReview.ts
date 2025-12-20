import { protectedProcedure } from '$lib/axios';
import type { EditReviewFormData } from '$lib/schemas';

export const editReview = async (reviewId: string, data: EditReviewFormData) => {
	const response = await protectedProcedure.patch<{
		success: boolean;
		message: string;
		reviewId: string;
		error?: string;
	}>(`/review/${reviewId}`, data);

	return response.data;
};
