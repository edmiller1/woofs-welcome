import { publicProcedure } from '$lib/axios';
import type { getCityResponse } from '$lib/types/responses';

export const getCity = async (city: string) => {
	const response = await publicProcedure.get<getCityResponse>(`/city/${city}`);

	return response.data;
};
