import { protectedProcedure } from '$lib/axios';
import { getFileBase64 } from '$lib/helpers';
import type { Claim } from '$lib/types/claim';

export const uploadClaimDocuments = async (claimId: string, files: File[]) => {
	const filesInput: { data: string; fileName: string }[] = [];

	for (const file of files) {
		const base64String = await getFileBase64(file);
		const fileName = file.name;
		filesInput.push({ data: base64String, fileName });
	}

	const response = await protectedProcedure.post<{ success: boolean; updatedClaim: Claim }>(
		`/claim/${claimId}/documents`,
		filesInput
	);

	return response.data;
};
