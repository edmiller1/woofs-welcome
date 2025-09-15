import { publicProcedure } from '$lib/axios';
import type { Breed } from '$lib/types/models';
import type { GetBreedsResponse } from '$lib/types/responses';

export const getBreeds = async () => {
	const response = await publicProcedure.get<GetBreedsResponse>('/review/breeds');

	if (response.data.error) {
		throw new Error(response.data.error);
	}

	return response.data;
};
