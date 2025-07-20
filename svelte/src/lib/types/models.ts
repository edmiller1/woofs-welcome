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
}

export interface Place {
	id: string;
	name: string;
	slug: string;
	types: string;
	images: PlaceImage[];
	description: string;
	address: string;
	latitude: string;
	longitude: string;
	phone: string;
	website: string;
	hours: string | null;
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

export interface IslandWithRegions extends Island {
	regions: Region[];
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
