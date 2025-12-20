import type {
	Breed,
	City,
	CityWithPlaces,
	CityWithRegion,
	Claim,
	IslandWithRegions,
	OptimizedImage,
	OptimizedReviewImage,
	Place,
	PlaceWithCityAndRegion,
	PlaceWithDistance,
	PlaceWithOptimizedImages,
	Region,
	RegionWithCities,
	RegionWithIsland,
	ReviewImage,
	ReviewWithUserAndImages,
	Stats
} from './models';

export interface CreateUserResponse {
	redirectUrl: string;
	isSynced: boolean;
	error?: string;
}

export interface GetRegionResponse extends Region {
	stats: Stats;
	popularPlaces: {
		id: string;
		name: string;
		slug: string;
		isVerified: boolean;
		rating: string;
		regionName: string;
		regionSlug: string;
		cityName: string;
		citySlug: string;
		types: string[];
		description: string;
		imageUrl: OptimizedImage;
		hasFavourited: boolean;
	}[];
	error?: string;
}

export interface getRegionPlacesResponse {
	places: {
		cityName: string;
		citySlug: string;
		regionName: string;
		regionSlug: string;
		id: string;
		name: string;
		slug: string;
		types: string[];
		description: string;
		isVerified: boolean;
		rating: string;
		reviewsCount: number;
		imageUrl: OptimizedImage;
		hasFavourited: boolean;
	}[];
	events: any[];
}

export interface getCityPlacesResponse {
	places: {
		cityName: string;
		citySlug: string;
		regionName: string;
		regionSlug: string;
		id: string;
		name: string;
		slug: string;
		types: string[];
		description: string;
		isVerified: boolean;
		rating: string;
		reviewsCount: number;
		imageUrl: OptimizedImage;
		hasFavourited: boolean;
	}[];
	events: any[];
}

export interface GetIslandResponse extends IslandWithRegions {
	stats: Stats;
	popularPlaces: {
		id: string;
		name: string;
		slug: string;
		isVerified: boolean;
		rating: string;
		regionName: string;
		regionSlug: string;
		cityName: string;
		citySlug: string;
		types: string[];
		description: string;
		imageUrl: OptimizedImage;
		hasFavourited: boolean;
	}[];
	error?: string;
}

export interface getIslandPlacesResponse {
	places: {
		cityName: string;
		citySlug: string;
		regionName: string;
		regionSlug: string;
		id: string;
		name: string;
		slug: string;
		types: string[];
		description: string;
		isVerified: boolean;
		rating: string;
		reviewsCount: number;
		imageUrl: OptimizedImage;
		hasFavourited: boolean;
	}[];
	events: any[];
}

export interface getCityResponse extends CityWithRegion {
	stats: Stats;
	popularPlaces: {
		id: string;
		name: string;
		slug: string;
		isVerified: boolean;
		rating: string;
		regionName: string;
		regionSlug: string;
		cityName: string;
		citySlug: string;
		types: string[];
		description: string;
		imageUrl: OptimizedImage;
		hasFavourited: boolean;
	}[];
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

export interface GetNearbyPlacesResponse {
	places: PlaceWithDistance[];
	center: {
		lat: number;
		lng: number;
	};
	radius: number;
	error?: string;
}

export interface GetExplorePlacesResponse {
	places: PlaceWithOptimizedImages[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasMore: boolean;
	};
}

export interface SearchLocationsResponse {
	id: string;
	name: string;
	slug: string;
	displayName: string;
	region: string | null;
	placeCount: number;
	type: 'city' | 'region';
}

export interface ProfileReviewResponse {
	data: {
		content: string;
		createdAt: string;
		dogBreeds: string[];
		id: string;
		images: OptimizedReviewImage[];
		isFirstVisit: boolean;
		likesCount: number;
		numDogs: number;
		place: PlaceWithCityAndRegion;
		placeId: string;
		rating: number;
		timeOfVisit: string;
		title: string;
		updatedAt: string;
		userId: string;
		visitDate: string;
	}[];
	total: number;
	hasMore: boolean;
}
