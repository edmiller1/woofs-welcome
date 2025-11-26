import { requireGuest } from '$lib/auth/guard';

export const load = async () => {
	await requireGuest();
};
