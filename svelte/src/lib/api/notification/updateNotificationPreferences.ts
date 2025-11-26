import { protectedProcedure } from '$lib/axios';
import type { NotificationPreferences, NotificationPreferencesInput } from '$lib/types/models';

export const updateNotificationPreferences = async (updates: NotificationPreferencesInput) => {
	const response = await protectedProcedure.patch<{ updatedPrefs: NotificationPreferences }>(
		'/notification',
		updates
	);

	return response.data;
};
