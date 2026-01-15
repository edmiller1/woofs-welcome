import { protectedProcedure } from '$lib/axios';
import type { ClaimWithDetails } from '$lib/types/claim';

export const getBusinessClaims = async (businessId: string) => {
	const response = await protectedProcedure.get<ClaimWithDetails[]>(
		`/claim/business/${businessId}`
	);

	return response.data;
};
