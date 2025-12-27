import { protectedProcedure } from '$lib/axios';

export const deleteAccount = async () => {
	const response = await protectedProcedure.delete<{ success: boolean }>('/user/account');

	return response.data;
};
