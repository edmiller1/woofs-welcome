import { protectedProcedure } from '$lib/axios';
import type { NotificationPreferences } from '$lib/types/models';

export const getNotificationPreferences = async () => {
	const response = await protectedProcedure.get<NotificationPreferences>('/notification');

	return response.data;
};
