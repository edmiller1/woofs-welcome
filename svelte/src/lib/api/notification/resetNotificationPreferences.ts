import { protectedProcedure } from '$lib/axios';
import type { NotificationPreferences } from '$lib/types/notification';

export const resetNotificationPreferences = async () => {
	const response = await protectedProcedure.delete<{
		defaultPreferences: NotificationPreferences;
		success: boolean;
		message: string;
	}>('/notification/user/preferences');

	return response.data;
};
