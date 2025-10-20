import { protectedProcedure } from '$lib/axios';

export const welcome = async (data: { name: string; image?: string }) => {
	const response = await protectedProcedure.post<{ success: boolean; error?: string }>(
		'/user/welcome',
		data
	);

	return response.data.success;
};
