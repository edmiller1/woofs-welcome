import { publicProcedure } from '$lib/axios';

export const checkEmails = async (email: string) => {
	const response = await publicProcedure.get(`/user/check-emails/${email}`);

	return response.data.exists;
};
