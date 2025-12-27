import { protectedProcedure } from '$lib/axios';

export const updatePrivacy = async (isProfilePublic: boolean) => {
	const response = await protectedProcedure.patch<{ success: boolean }>('/user/privacy', {
		isProfilePublic
	});

	return response.data;
};
