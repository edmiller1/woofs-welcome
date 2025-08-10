import type {
	City,
	CityWithPlaces,
	IslandWithRegions,
	Place,
	RegionStats,
	RegionWithIsland
} from './models';

export interface CreateUserResponse {
	redirectUrl: string;
	isSynced: boolean;
	error?: string;
}

export interface GetRegionResponse {
	cities: CityWithPlaces[];
	region: RegionWithIsland;
	stats: RegionStats;
	foodSpots: Place[];
	stays: Place[];
	adventures: Place[];
	retailPlaces: Place[];
	error?: string;
}

export interface GetIslandResponse extends IslandWithRegions {
	error?: string;
}

export interface getCityResponse {
	city: City;
	error?: string;
}
