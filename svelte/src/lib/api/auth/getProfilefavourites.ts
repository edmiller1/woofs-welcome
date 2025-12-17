import { protectedProcedure } from '$lib/axios';
import type { FavouriteWithOptimizedImages } from '$lib/types/models';

export const getProfileFavourites = async (limit: number = 12, offset: number = 0) => {
	const response = await protectedProcedure.get<{
		data: FavouriteWithOptimizedImages[];
		total: number;
		hasMore: boolean;
	}>('/user/favourites/profile', {
		params: { limit, offset }
	});

	return response.data;
};
