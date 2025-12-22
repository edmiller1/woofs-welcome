import { publicProcedure } from '$lib/axios';
import type { City } from '$lib/types/city';

export const getCities = async () => {
	const response = await publicProcedure.get<City[]>('/city/list/cities');

	return response.data;
};
