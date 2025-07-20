import { api } from '$lib/api';
import { getUser } from '$lib/auth/guard';

export const load = async () => {
	const user = await getUser();
	const places = await api.place.getPlaces;

	return {
		user,
		places
	};
};
