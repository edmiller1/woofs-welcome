import { publicProcedure } from '$lib/axios';
import type { GetDogBreedsResponse } from '$lib/types/review';

export const getBreeds = async () => {
	const response = await publicProcedure.get<GetDogBreedsResponse>('/review/breeds');

	return response.data;
};
