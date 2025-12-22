import { protectedProcedure } from '$lib/axios';
import type { GetProfileFavouritesResponse } from '$lib/types/user';

export const getProfileFavourites = async (limit: number = 12, offset: number = 0) => {
	const response = await protectedProcedure.get<GetProfileFavouritesResponse>(
		'/user/favourites/profile',
		{
			params: { limit, offset }
		}
	);

	return response.data;
};
