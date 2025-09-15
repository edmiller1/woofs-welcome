import { protectedProcedure, publicProcedure } from '$lib/axios';
import type { GetPlaceResponse } from '$lib/types/responses';

export const getPlace = async (slug: string) => {
	const response = await protectedProcedure.get<GetPlaceResponse>(`/place/${slug}`);

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
