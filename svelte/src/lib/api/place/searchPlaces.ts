import { protectedProcedure } from '$lib/axios';
import type { GetPlaceResponse } from '$lib/types/place';

export const searchPlaces = async (query: string, limit: number = 10) => {
	const searchParams = new URLSearchParams();
	searchParams.set('q', query);
	searchParams.set('limit', limit.toString());

	const response = await protectedProcedure.get<{ places: GetPlaceResponse[] }>(
		`/place/search?${searchParams.toString()}`
	);

	return response.data.places;
};
