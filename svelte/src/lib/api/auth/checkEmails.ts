import { publicProcedure } from '$lib/axios';
import type { CheckEmailsResponse } from '$lib/types/responses';

export const checkEmails = async (email: string) => {
	const response = await publicProcedure.get<CheckEmailsResponse>(`/user/check-emails/${email}`);

	return response.data.exists;
};
