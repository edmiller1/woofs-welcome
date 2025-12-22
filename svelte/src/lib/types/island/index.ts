import type { PlaceSort, PopularPlaces } from '../place';
import type { Region } from '../region';
import type { OptimizedImage } from '../types';

export interface Island {
	id: string;
	name: string;
	slug: string;
	image: string;
	createdAt: string;
	updatedAt: string;
}

export interface GetIslandResponse {
	createdAt: string;
	id: string;
	image: string;
	name: string;
	optimizedImage: OptimizedImage;
	slug: string;
	updatedAt: string;
	popularPlaces: PopularPlaces[];
	regions: Region[];
	stats: {
		totalAdventures: number;
		totalEats: number;
		totalPlaces: number;
		totalStays: number;
		totalStores: number;
	};
}

export interface GetIslandPlacesResponse {
	events: any[];
	places: PlaceSort[];
}
