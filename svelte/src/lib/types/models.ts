export interface BAUser {
	id: string;
	name: string;
	emailVerified: boolean;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	image?: string | null;
}

export interface Island {
	id: string;
	name: string;
	slug: string;
	image: string;
	createdAt: string;
	updatedAt: string;
}

export interface Region {
	id: string;
	name: string;
	slug: string;
	islandId: string;
	image: string;
	createdAt: string;
	updatedAt: string;
	optimizedImage: OptimizedImage;
}

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
	optimizedImage: OptimizedImage;
}

export interface Hours {
	Monday?: string;
	Tuesday?: string;
	Wednesday?: string;
	Thursday?: string;
	Friday?: string;
	Saturday?: string;
	Sunday?: string;
}

export type DayOfWeek =
	| 'Monday'
	| 'Tuesday'
	| 'Wednesday'
	| 'Thursday'
	| 'Friday'
	| 'Saturday'
	| 'Sunday';

export type DayOfWeekHours = Partial<Record<DayOfWeek, string>>;

export interface Place {
	id: string;
	name: string;
	slug: string;
	types: string[];
	images: PlaceImage[];
	description: string;
	address: string;
	latitude: string;
	longitude: string;
	phone: string;
	website: string;
	email: string | null;
	hours: Hours | null;
	dogPolicy: string | null;
	indoorAllowed: boolean;
	outdoorAllowed: boolean;
	rating: number;
	reviewsCount: number;
	isVerified: boolean;
	isFeatured: boolean;
	createdAt: string;
	updatedAt: string;
	cityId: string;
	regionName?: string;
	regionSlug?: string;
	cityName?: string;
	citySlug?: string;
	activeClaim?: Claim | null;
}

export interface PlaceImage {
	id: string;
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
	placeId: string;
	publicId: string;
}

export interface IslandPlace extends Place {
	cityName: string;
	citySlug: string;
	regionName: string;
	regionSlug: string;
}

export interface OptimizedImage extends PlaceImage {
	responsive: {
		'2xl': string;
		lg: string;
		md: string;
		sm: string;
		xs: string;
	};
	sizes: string;
	src: string;
	srcset: string;
	webp: {
		src: string;
		srcset: string;
	};
}

export interface PopularCity {
	id: string;
	name: string;
	image: OptimizedImage;
	placeCount: number;
	regionName: string;
	regionSlug: string;
	slug: string;
}

export interface IslandWithRegions extends Island {
	optimizedImage: OptimizedImage;
	regions: Region[];
	popularCities: City[];
	foodSpots: IslandPlace[];
	retailSpots: IslandPlace[];
	adventures: IslandPlace[];
	verifiedPlaces: IslandPlace[];
}

export interface RegionWithIsland extends Region {
	island: Island;
}

export interface RegionWithCities extends Region {
	cities: CityWithPlaces[];
}

export interface CityWithPlaces extends City {
	places: Place[];
}

export interface CityWithRegion extends City {
	region: RegionWithIsland;
}

export interface Stats {
	totalAdventures: number;
	totalEats: number;
	totalPlaces: number;
	totalStays: number;
	totalStores: number;
}

export interface Claim {
	id: string;
	placeId: string;
	userId: string;
	status: string;
	proof: string;
	approvedAt: string;
	approvedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface Tab {
	name: string;
	href: string;
}

export interface Breed {
	id: string;
	name: string;
	createdAt: string;
}

export interface PlaceWithOptimizedImages extends Place {
	city: CityWithRegion;
	images: {
		id: string;
		altText: string;
		caption: string;
		createdAt: string;
		displayOrder: number;
		isApproved: boolean;
		isPrimary: boolean;
		source: string;
		url: string;
		placeId: string;
		publicId: string;
		sizes: string;
		updatedAt: string;
		uploadedBy: string;
		src: string;
		srcset: string;
		responsive: {
			'2xl': string;
			lg: string;
			md: string;
			sm: string;
			xs: string;
		};
		webp: {
			src: string;
			srcset: string;
		};
	}[];
	hasFavourited?: boolean;
	reviews: ReviewWithUserAndImages[];
}

export interface Review {
	id: string;
	placeId: string;
	userId: string;
	rating: number;
	title: string;
	content: string;
	visitDate: string;
	numDogs: number;
	dogBreeds: string[];
	timeOfVisit: string;
	isFirstVisit: boolean;
	likesCount: number;
	createdAt: string;
	updatedAt: string;
	user: {
		id: string;
		name: string;
		image: string;
	};
}

export interface ReviewImage {
	id: string;
	reviewId: string;
	publicId: string;
	url: string;
	altText: string;
	createdAt: string;
	updatedAt: string;
}

export interface ReviewWithUserAndImages extends Review {
	user: {
		id: string;
		name: string;
		image: string;
	};
	images: ReviewImage[];
	likes: Like[];
	hasLiked?: boolean;
	hasReported?: boolean;
}

export interface ErrorResponse {
	error: string;
}

export interface Like {
	id: string;
	createdAt: string;
	updatedAt: string;
	reviewId: string;
	userId: string;
}

export interface PlaceWithDistance extends Place {
	distance: number;
	isFavourited: boolean;
	activeClaim: Claim | null;
}

export interface SearchSuggestion {
	id: string;
	name: string;
	type: 'place' | 'history';
	location?: string;
}

export type PlaceType =
	| 'Park'
	| 'Restaurant'
	| 'Hotel'
	| 'Motel'
	| 'AirBnb'
	| 'Store'
	| 'Café'
	| 'Bar'
	| 'Dog Park'
	| 'Beach'
	| 'Walk'
	| 'Hike'
	| 'Service'
	| 'Activity'
	| 'Lake'
	| 'River'
	| 'Trail';

export type DogAccess = 'indoor' | 'outdoor' | 'both';

export type Location = {
	id: string;
	name: string;
	displayName: string;
	region: string | null;
	placeCount: number;
	type: 'city' | 'region';
};

export type FilterState = {
	location: string | null;
	types: string[];
	dogAccess: DogAccess;
	minRating: number;
};

export interface ExplorePlace {
	id: string;
	name: string;
	slug: string;
	types: PlaceType[];
	description: string | null;
	city: {
		id: string;
		name: string;
		slug: string;
		region: {
			id: string;
			name: string;
			slug: string;
		};
	} | null;
	images: {
		id: string;
		url: string;
		caption: string | null;
		altText: string | null;
		isPrimary: boolean;
	}[];
	rating: string;
	reviewsCount: number;
	indoorAllowed: boolean;
	outdoorAllowed: boolean;
	isVerified: boolean;
	isFeatured: boolean;
	hasFavourited?: boolean;
}

export interface ExplorePlacesRequest {
	city?: string;
	types?: string[];
	dogAccess?: 'indoor' | 'outdoor' | 'both';
	page?: number;
	limit?: number;
	minRating?: number;
	sortBy?: 'rating' | 'recent' | 'name';
}

export interface Favourite extends Place {
	cityId: string;
	city: CityWithRegion;
}
