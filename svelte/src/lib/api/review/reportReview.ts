import { protectedProcedure } from '$lib/axios';
import type { ReportReviewResponse } from '$lib/types/responses';

export const reportReview = async (
	slug: string,
	reportData: { reason: string; details: string }
) => {
	const response = await protectedProcedure.post<ReportReviewResponse>(
		`/review/${slug}/report`,
		reportData
	);

	if (response.status !== 200) {
		throw new Error(response.data.error || 'An error occurred while reporting the review.');
	}

	return response.data;
};
