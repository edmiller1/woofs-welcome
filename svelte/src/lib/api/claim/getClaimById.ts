import { protectedProcedure } from '$lib/axios';
import type { ClaimWithDetails } from '$lib/types/claim';

export const getClaimById = async (claimId: string) => {
	const response = await protectedProcedure.get<{ claim: ClaimWithDetails }>(`/claim/${claimId}`);

	return response.data;
};
