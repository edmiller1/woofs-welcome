import { protectedProcedure } from '$lib/axios';

export const checkClaimEligibility = async (placeSlug: string) => {
	const response = await protectedProcedure.get<{
		canClaim: boolean;
		reason: string | null;
		claimedAt?: string;
		pendingClaimId?: string;
	}>(`/claim/eligibility/${placeSlug}`);

	return response.data;
};
