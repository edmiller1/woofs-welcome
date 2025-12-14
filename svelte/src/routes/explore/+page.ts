import { api } from '$lib/api';
import { getUser } from '$lib/auth/guard';

export const load = async ({ url }) => {
	const user = await getUser();
	const searchParams = url.searchParams;

	const typesParam = searchParams.get('types');
	const types = typesParam ? typesParam.split(',').filter(Boolean) : [];

	const filters = {
		location: searchParams.get('location')?.toLowerCase() || undefined,
		types: types.length > 0 ? types : undefined,
		dogAccess: (searchParams.get('dogAccess') as 'indoor' | 'outdoor' | 'both') || undefined,
		minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
		isNew: searchParams.get('isNew') === 'true',
		isVerified: searchParams.get('isVerified') === 'true',
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
