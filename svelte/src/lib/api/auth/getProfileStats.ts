import { protectedProcedure } from '$lib/axios';
import type { ProfileStats } from '$lib/types/user';

export const getProfileStats = async (userId?: string) => {
	const endpoint = userId ? `/user/stats/${userId}` : '/user/stats';

	const response = await protectedProcedure.get<ProfileStats>(endpoint);

	return response.data;
};
