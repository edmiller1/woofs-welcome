import { api } from '$lib/api';
import { getUser } from '$lib/auth/guard';
import type { Load } from '@sveltejs/kit';

export const load: Load = async () => {
	const user = await getUser();
	const places = await api.place.getPlaces;

	return {
		user,
		places
	};
};
