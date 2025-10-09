import { protectedProcedure } from '$lib/axios';

export const welcome = async (data: { name: string; image?: string }) => {
	const response = await protectedProcedure.post<{ success: boolean; error?: string }>(
		'/user/welcome',
		data
	);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data.success;
};
