import type {
	City,
	CityWithPlaces,
	CityWithRegion,
	Claim,
	IslandWithRegions,
	Place,
	RegionWithIsland,
	Stats
} from './models';

export interface CreateUserResponse {
	redirectUrl: string;
	isSynced: boolean;
	error?: string;
}

export interface GetRegionResponse {
	cities: CityWithPlaces[];
	region: RegionWithIsland;
	stats: Stats;
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
	city: CityWithRegion;
	stats: Stats;
	foodSpots: Place[];
	stays: Place[];
	adventures: Place[];
	retail: Place[];
	error?: string;
}

export interface GetPlaceResponse extends Place {
	city: CityWithRegion;
	claim: Claim;
	error?: string;
}

export interface CheckEmailsResponse {
	exists: boolean;
	error?: string;
}
