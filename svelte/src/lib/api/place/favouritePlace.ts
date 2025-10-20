import { protectedProcedure } from '$lib/axios';
import type { FavouritePlaceResponse } from '$lib/types/responses';

export const favouritePlace = async (placeId: string) => {
	const response = await protectedProcedure.post<FavouritePlaceResponse>(
		`/place/${placeId}/favourite`
	);

	return response.data;
};
