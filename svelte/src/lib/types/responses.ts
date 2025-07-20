import type { CityWithPlaces, IslandWithRegions, RegionStats, RegionWithIsland } from './models';

export interface CreateUserResponse {
	redirectUrl: string;
	isSynced: boolean;
	error?: string;
}

export interface GetRegionResponse {
	cities: CityWithPlaces[];
	region: RegionWithIsland;
	stats: RegionStats;
	error?: string;
}

export interface GetIslandResponse extends IslandWithRegions {
	error?: string;
}
