import { createInfiniteQuery } from '@tanstack/svelte-query';
import { derived } from 'svelte/store';
import { api } from '$lib/api';
import { filtersStore, type FilterState } from '$lib/stores/filters';

export function useExplorePlacesQuery() {
	// Create a derived store that serializes the filters
	const serializedFilters = derived(filtersStore, ($filters) => ({
		location: $filters.location || null,
		types: ($filters.types || []).sort() || null,
		dogAccess: $filters.dogAccess || 'both',
		minRating: $filters.minRating || 0
	}));

	// Get the current value for the query key
	let currentFilters: any;
	const unsubscribe = serializedFilters.subscribe((value) => {
		currentFilters = value;
	});
	unsubscribe();

	console.log('🎣 useExplorePlacesQuery called');

	return createInfiniteQuery({
		queryKey: ['explore-places', currentFilters],
		queryFn: async ({ pageParam }) => {
			// Get the latest filters from the store
			let filters: FilterState | null = null;
			const unsub = filtersStore.subscribe((value) => {
				filters = value;
			});
			unsub();

			console.log('📡 Fetching with filters:', filters);
			console.log('📡 Fetching with params:', {
				city: filters!.location || undefined,
				types: filters!.types && filters!.types.length > 0 ? filters!.types : undefined,
				dogAccess: filters!.dogAccess !== 'both' ? filters!.dogAccess : undefined,
				minRating: filters!.minRating && filters!.minRating > 0 ? filters!.minRating : undefined,
				page: pageParam,
				limit: 20,
				sortBy: 'rating'
			});

			return api.place.getExplorePlaces({
				city: filters!.location || undefined,
				types: filters!.types && filters!.types.length > 0 ? filters!.types : undefined,
				dogAccess: filters!.dogAccess !== 'both' ? filters!.dogAccess : undefined,
				minRating: filters!.minRating && filters!.minRating > 0 ? filters!.minRating : undefined,
				page: pageParam,
				limit: 20,
				sortBy: 'rating'
			});
		},
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
		},
		initialPageParam: 0
	});
}
