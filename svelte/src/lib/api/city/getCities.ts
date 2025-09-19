import { publicProcedure } from '$lib/axios';
import type { City } from '$lib/types/models';

export const getCities = async () => {
	const response = await publicProcedure.get<City[]>('/city/list/cities');

	if (response.status !== 200) {
		throw new Error('Failed to fetch cities');
	}

	return response.data;
};
