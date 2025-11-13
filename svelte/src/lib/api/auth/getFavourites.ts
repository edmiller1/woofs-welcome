import { protectedProcedure } from '$lib/axios';
import type { Favourite } from '$lib/types/models';

export const getFavourites = async () => {
	const response = await protectedProcedure.get<Favourite[]>('/user/favourites');

	return response.data;
};
