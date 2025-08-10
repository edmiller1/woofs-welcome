export interface BAUser {
	id: string;
	name: string;
	emailVerified: boolean;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	image?: string | null | undefined | undefined;
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
	hours: any;
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
}

export interface IslandPlace extends Place {
	cityName: string;
	citySlug: string;
	regionName: string;
	regionSlug: string;
}

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

export interface RegionStats {
	totalAdventures: number;
	totalEats: number;
	totalPlaces: number;
	totalStays: number;
	totalStores: number;
}
