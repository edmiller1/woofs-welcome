import { protectedProcedure } from '$lib/axios';
import type { Context } from '$lib/types/types';

export const switchContext = async (context: Context) => {
	const newContext = context === 'business' ? 'business' : 'personal';

	const response = await protectedProcedure.patch<{ success: boolean; context: Context }>(
		'/user/context',
		{
			context: newContext
		}
	);

	return response.data;
};
