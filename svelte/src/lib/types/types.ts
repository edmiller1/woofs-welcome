import type { GetPlaceResponse, PlaceImage } from './place';

export interface OptimizedImage {
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

export interface OptimizedPlaceImage extends PlaceImage {
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

export interface SearchPlacesResponse {
	places: GetPlaceResponse[];
}

export interface SearchLocationsresponse {
	displayName: string;
	id: string;
	name: string;
	placeCount: number;
	region: string;
	slug: string;
	type: 'city' | 'region';
}

export interface Tab {
	name: string;
	href: string;
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
	slug: string;
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
	isNew: boolean;
	isVerified: boolean;
};

export type Context = 'personal' | 'business';
