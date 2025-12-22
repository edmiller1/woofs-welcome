import type { CityWithRegion } from '../city';
import type { Claim } from '../claim';
import type { Hours, OptimizedImage, OptimizedPlaceImage } from '../types';

export interface Place {
	id: string;
	name: string;
	slug: string;
	types: string[];
	description: string;
	cityId: string;
	address: string;
	latitude: string;
	longitude: string;
	phone: string;
	website: string;
	email: string;
	hours: any;
	dogPolicy: string;
	indoorAllowed: boolean;
	outdoorAllowed: boolean;
	hasDogMenu: boolean;
	rating: string;
	reviewsCount: string;
	isVerified: string;
	isFeatured: string;
	createdAt: string;
	updatedAt: string;
	City: CityWithRegion;
	images: OptimizedImage[];
	cityName: string;
	citySlug: string;
	regionName: string;
	regionSlug: string;
}

export interface PlaceImage {
	id: string;
	placeId: string;
	publicId: string;
	url: string;
	caption: string;
	altText: string;
	isPrimary: boolean;
	source: string;
	uploadedBy: string;
	isApproved: boolean;
	displayOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface PopularPlaces {
	cityName: string;
	citySlug: string;
	description: string;
	hasFavourited: boolean;
	id: string;
	imageUrl: OptimizedImage;
	isVerified: boolean;
	name: string;
	rating: string;
	regionName: string;
	regionSlug: string;
	reviewsCount: number;
	slug: string;
	types: string[];
}

export interface PlaceSort {
	cityName: string;
	citySlug: string;
	description: string;
	hasFavourited: boolean;
	id: string;
	imageUrl: OptimizedImage;
	isVerified: boolean;
	name: string;
	rating: string;
	regionName: string;
	regionSlug: string;
	reviewsCount: number;
	slug: string;
	types: string[];
}

export interface GetPlaceResponse {
	activeClaim: Claim | null;
	address: string;
	city: CityWithRegion;
	cityId: string;
	createdAt: string;
	description: string | null;
	dogPolicy: string | null;
	email: string | null;
	hasDogMenu: boolean;
	hours: Hours | null;
	id: string;
	images: OptimizedPlaceImage[];
	indoorAllowed: boolean;
	isFavourited: boolean;
	isFeatured: boolean;
	isVerified: boolean;
	latitide: string;
	longitude: string;
	name: string;
	outdoorAllowed: boolean;
	phone: string | null;
	rating: string;
	reviewsCount: number;
	slug: string;
	types: string[];
	updatedAt: string;
	website: string | null;
}

export interface GetPlaceReviewStatsResponse {
	averageRating: number;
	reviewBreakdown: Array<{ count: number; percentage: number; rating: number }>;
	totalReviews: number;
}

export interface GetPlaceReviewsResponse {
	reviews: {
		content: string;
		createdAt: string;
		dogBreeds: string[];
		hasLiked: boolean;
		hasReported: string;
		id: string;
		images: OptimizedPlaceImage[];
		isFirstVisit: boolean;
		likesCount: number;
		numDogs: number;
		placeId: string;
		rating: number;
		timeOfVisit: string;
		title: string;
		updatedAt: string;
		userId: string;
		visitDate: string;
	}[];
}

export interface GetNearbyPlacesResponse {
	center: {
		lat: number;
		lng: number;
	};
	places: GetPlaceResponse[];
	radius: number;
}

export interface FavouritePlaceResponse {
	success: boolean;
	action: 'added' | 'removed';
	error?: string;
}

export interface ExplorePlacesRequest {
	location?: string;
	types?: string[];
	dogAccess?: 'indoor' | 'outdoor' | 'both';
	page?: number;
	limit?: number;
	minRating?: number;
	sortBy?: 'rating' | 'recent' | 'name';
	isNew?: boolean;
	isVerified?: boolean;
}

export interface GetExplorePlacesResponse {
	pagination: {
		hasMore: boolean;
		limit: number;
		page: number;
		total: number;
		totalPages: number;
	};
	places: GetPlaceResponse[];
}

export interface GetHomePlacesResponse {
	places: GetPlaceResponse[];
}

export interface FilterablePlace {
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
}

export interface PlaceWithDistance extends Place {
	distance: number;
	isFavourited: boolean;
	activeClaim: Claim | null;
}
