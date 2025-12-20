import { protectedProcedure } from '$lib/axios';

export const deleteReview = async (slug: string, reviewId: string) => {
	const response = await protectedProcedure.delete<{ success: boolean; error?: string }>(
		`/review/${slug}/${reviewId}`
	);

	return response.data;
};
