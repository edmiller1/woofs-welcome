import { publicProcedure } from '$lib/axios';
import type { GetCityResponse } from '$lib/types/city';

export const getCity = async (city: string) => {
	const response = await publicProcedure.get<GetCityResponse>(`/city/${city}`);

	return response.data;
};
