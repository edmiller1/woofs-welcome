import { protectedProcedure } from '$lib/axios';
import type { NotificationPreferences } from '$lib/types/models';

export const resetNotificationPreferences = async () => {
	const response = await protectedProcedure.delete<{
		defaultPreferences: NotificationPreferences;
		success: boolean;
		message: string;
	}>('/notification');

	return response.data;
};
