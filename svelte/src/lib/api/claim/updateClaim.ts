import { protectedProcedure } from '$lib/axios';
import type { Claim } from '$lib/types/claim';

export interface UpdateClaimInput {
	role?: 'Owner' | 'Manager' | 'Marketing Manager' | 'Staff' | 'Other';
	additionalNotes?: string;
	documentsToRemove?: string[];
	documentsToAdd?: Array<{ data: string; fileName: string }>;
}

export const updateClaim = async (claimId: string, input: UpdateClaimInput) => {
	const response = await protectedProcedure.patch<{ success: boolean; claim: Claim }>(
		`/claim/${claimId}`,
		input
	);

	return response.data;
};
