import type {
	Breed,
	City,
	CityWithPlaces,
	CityWithRegion,
	Claim,
	IslandWithRegions,
	Place,
	PlaceWithOptimizedImages,
	RegionWithIsland,
	ReviewWithUserAndImages,
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
	claim: Claim | null;
	isFavourited: boolean;
	error?: string;
}

export interface CheckEmailsResponse {
	exists: boolean;
	error?: string;
}

export interface FavouritePlaceResponse {
	success: boolean;
	action: 'added' | 'removed';
	error?: string;
}

export interface GetBreedsResponse {
	breeds: Breed[];
	error?: string;
}

export interface GetRandomPlacesResponse {
	places: PlaceWithOptimizedImages[];
}

export interface CreateReviewResponse {
	success: boolean;
	placeId: string;
	placeSlug: string;
	reviewId: string;
	message: string;
	error?: string;
}

export interface GetPlaceReviewsResponse {
	reviews: ReviewWithUserAndImages[];
	error?: string;
}

export interface GetPlaceReviewStatsResponse {
	totalReviews: number;
	averageRating: number;
	reviewBreakdown: Array<{
		rating: number;
		count: number;
		percentage: number;
	}>;
	error?: string;
}

export interface LikeReviewResponse {
	success: boolean;
	action: 'added' | 'removed';
	error?: string;
}

export interface ReportReviewResponse {
	success: boolean;
	action: 'added';
	error?: string;
}
