import type { Island } from '../island';
import type { PlaceSort, PopularPlaces } from '../place';
import type { OptimizedImage } from '../types';

export interface Region {
	id: string;
	name: string;
	slug: string;
	image: string;
	islandId: string;
	createdAt: string;
	updatedAt: string;
}

export interface RegionWithIsland extends Region {
	island: Island;
}

export interface GetRegionResponse {
	createdAt: string;
	id: string;
	image: string;
	island: Island;
	name: string;
	optimizedImage: OptimizedImage;
	popularPlaces: PopularPlaces[];
	slug: string;
	updatedAt: string;
	stats: {
		totalAdventures: number;
		totalEats: number;
		totalPlaces: number;
		totalStays: number;
	};
}

export interface GetRegionplacesResponse {
	events: any[];
	places: PlaceSort[];
}
