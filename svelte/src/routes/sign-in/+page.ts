import { requireGuest } from '$lib/auth/guard';
import type { Load } from '@sveltejs/kit';

export const load: Load = async () => {
	await requireGuest();
};
