import { protectedProcedure } from '$lib/axios';
import type { Claim, SubmitClaimInput } from '$lib/types/claim';

export const submitClaim = async (input: SubmitClaimInput) => {
	const response = await protectedProcedure.post<{ success: boolean; claim: Claim }>(
		'/claim/submit',
		input
	);

	return response.data;
};
