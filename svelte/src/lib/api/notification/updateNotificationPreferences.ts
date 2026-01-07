import { protectedProcedure } from '$lib/axios';
import type {
	NotificationPreferences,
	NotificationPreferencesInput
} from '$lib/types/notification';

export const updateNotificationPreferences = async (updates: NotificationPreferencesInput) => {
	const response = await protectedProcedure.patch<{ updatedPrefs: NotificationPreferences }>(
		'/notification/user/preferences',
		updates
	);

	return response.data;
};
