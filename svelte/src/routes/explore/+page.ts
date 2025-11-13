import { api } from '$lib/api';
import { getUser } from '$lib/auth/guard';
import type { FilterState } from '$lib/types/models';

export const load = async ({ url }) => {
	const user = await getUser();
	const searchParams = url.searchParams;

	const typesParam = searchParams.get('types');
	const types = typesParam ? typesParam.split(',').filter(Boolean) : [];

	const filters = {
		city: searchParams.get('location') || undefined,
		types: types.length > 0 ? types : undefined,
		dogAccess: (searchParams.get('dogAccess') as 'indoor' | 'outdoor' | 'both') || undefined,
		minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
		page: 0,
		limit: 20,
		sortBy: 'rating' as const
	};

	const placesData = await api.place.getExplorePlaces(filters);

	return {
		user,
		initialPlaces: placesData.places,
		pagination: placesData.pagination,
		searchParams: Object.fromEntries(searchParams.entries())
	};
};
