import { protectedProcedure } from '$lib/axios';
import type { GetNearbyPlacesResponse } from '$lib/types/place';

export const getNearbyPlaces = async (data: {
	slug: string;
	lat: number;
	lng: number;
	radius: number;
}) => {
	const reponse = await protectedProcedure.get<GetNearbyPlacesResponse>(
		`/place/nearby/${data.slug}`,
		{
			params: {
				lat: data.lat,
				lng: data.lng,
				radius: data.radius
			}
		}
	);

	return reponse.data;
};
