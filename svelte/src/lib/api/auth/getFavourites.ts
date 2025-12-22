import { protectedProcedure } from '$lib/axios';
import type { GetFavouritesResponse } from '$lib/types/user';

export const getFavourites = async () => {
	const response = await protectedProcedure.get<GetFavouritesResponse[]>('/user/favourites');

	return response.data;
};
