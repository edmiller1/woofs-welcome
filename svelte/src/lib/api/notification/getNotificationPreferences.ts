import { protectedProcedure } from '$lib/axios';
import type { NotificationPreferences } from '$lib/types/notification';

export const getNotificationPreferences = async () => {
	const response = await protectedProcedure.get<NotificationPreferences>(
		'/notification/user/preferences'
	);

	return response.data;
};
