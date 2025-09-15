import { protectedProcedure } from '$lib/axios';
import type { FavouritePlaceResponse } from '$lib/types/responses';

export const favouritePlace = async (placeId: string) => {
	const response = await protectedProcedure.post<FavouritePlaceResponse>(
		`/place/${placeId}/favourite`
	);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
