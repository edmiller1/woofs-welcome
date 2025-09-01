import { publicProcedure } from '$lib/axios';
import type { CheckEmailsResponse } from '$lib/types/responses';

export const checkEmails = async (email: string) => {
	const response = await publicProcedure.get<CheckEmailsResponse>(`/user/check-emails/${email}`);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data.exists;
};
