import { writable } from 'svelte/store';
import type { PlaceType } from '$lib/types/models';

export type FilterState = {
	location: string | null;
	types: PlaceType[];
	dogAccess: 'indoor' | 'outdoor' | 'both';
	minRating: number;
};

export const filtersStore = writable<FilterState>({
	location: null,
	types: [],
	dogAccess: 'both',
	minRating: 0
});
