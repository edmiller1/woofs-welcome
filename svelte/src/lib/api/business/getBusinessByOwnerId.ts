import { protectedProcedure } from '$lib/axios';

export const getBusinessByOwnerId = async (ownerId: string) => {
	const response = await protectedProcedure.get<{ exists: boolean }>(`/business/${ownerId}`);

	return response.data;
};
