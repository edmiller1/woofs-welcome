import { protectedProcedure } from '$lib/axios';
import { type CreateUserResponse } from '$lib/types/responses';

export const createUser = async (accessToken?: string) => {
	const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

	const response = await protectedProcedure.post<CreateUserResponse>('/auth/create', {}, config);

	return response.data;
};
