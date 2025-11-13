import { protectedProcedure } from '$lib/axios';
import type { PlaceWithOptimizedImages } from '$lib/types/models';

export const searchPlaces = async (query: string, limit: number = 10) => {
	const searchParams = new URLSearchParams();
	searchParams.set('q', query);
	searchParams.set('limit', limit.toString());

	const response = await protectedProcedure.get<{ places: PlaceWithOptimizedImages[] }>(
		`/place/search?${searchParams.toString()}`
	);

	return response.data.places;
};
