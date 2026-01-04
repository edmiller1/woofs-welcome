import { protectedProcedure } from '$lib/axios';
import type { CreateBusinessBody } from '$lib/schemas/business';
import type { Business } from '$lib/types/business';

export const createBusiness = async (data: CreateBusinessBody) => {
	const response = await protectedProcedure.post<Business>('/business/create', data);

	return response.data;
};
