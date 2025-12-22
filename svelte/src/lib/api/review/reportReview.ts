import { protectedProcedure } from '$lib/axios';
import type { ReportReviewResponse } from '$lib/types/review';

export const reportReview = async (
	slug: string,
	reportData: { reason: string; details: string }
) => {
	const response = await protectedProcedure.post<ReportReviewResponse>(
		`/review/${slug}/report`,
		reportData
	);

	return response.data;
};
