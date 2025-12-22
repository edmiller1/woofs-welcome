import { protectedProcedure } from '$lib/axios';
import type { GetPlaceResponse } from '$lib/types/place';

export const getPlace = async (slug: string) => {
	const response = await protectedProcedure.get<GetPlaceResponse>(`/place/${slug}`);

	return response.data;
};
