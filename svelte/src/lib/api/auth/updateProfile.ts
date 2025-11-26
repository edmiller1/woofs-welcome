import { protectedProcedure } from '$lib/axios';

export const updateProfile = async (data: { name?: string; image?: string }) => {
	const response = await protectedProcedure.patch<{ result: { success: boolean } }>(
		`/user/update`,
		data
	);
	return response.data.result;
};
