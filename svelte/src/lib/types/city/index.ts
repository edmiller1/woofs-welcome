import type { PlaceSort, PopularPlaces } from '../place';
import type { Region, RegionWithIsland } from '../region';
import type { OptimizedImage } from '../types';

export interface City {
	id: string;
	name: string;
	slug: string;
	latitude: string;
	longitude: string;
	isPopular: boolean;
	image: string;
	createdAt: string;
	updatedAt: string;
	regionId: string;
}

export interface CityWithRegion extends City {
	region: RegionWithIsland;
}

export interface GetCityResponse {
	createdAt: string;
	id: string;
	image: string;
	isPopular: boolean;
	latitude: string;
	longitude: string;
	name: string;
	optimizedImage: OptimizedImage;
	popularPlaces: PopularPlaces[];
	region: Region;
	slug: string;
	updatedAt: string;
	stats: {
		totalAdventures: number;
		totalEats: number;
		totalPlaces: number;
		totalStays: number;
		totalStores: number;
	};
}

export interface GetCityPlacesResponse {
	events: any[];
	places: PlaceSort[];
}
