import type { NotificationPreferences } from '../notification';
import type { GetPlaceResponse } from '../place';
import type { OptimizedReviewImage } from '../review';
import type { OptimizedImage } from '../types';

export interface BAUser {
	id: string;
	name: string;
	emailVerified: boolean;
	email: string;
	createdAt: string;
	updatedAt: string | Date;
	image?: OptimizedImage | null;
	provider: string;
	isProfilePublic: boolean;
	isBusinessAccount: boolean;
	activeContext: 'business' | 'personal';
	business: {
		email: string;
		id: string;
		logoUrl: OptimizedImage | null;
		logoPublicId: string;
		name: string;
		verified: boolean;
	};
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string;
	imagePublicId: string;
	provider: string;
	isAdmin: boolean;
	isBusinessAccount: boolean;
	businessName: string;
	businessEmail: string;
	businessPhone: string;
	website: string;
	businessDescription: string;
	logoUrl: string;
	verified: boolean;
	subscriptionTier: string;
	subscriptionExpiresAt: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string;
	notificationPreferences: NotificationPreferences;
}

export interface Session {
	id: string;
	expiresAt: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	ipAddress: string;
	userAgent: string;
	userId: string;
}

export interface Account {
	id: string;
	providerId: string;
	userId: string;
	accessToken: string;
	refreshToken: string;
	idToken: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
	scope: string;
	password: string;
	createdAt: string;
	updatedAt: string;
}

export interface verification {
	id: string;
	identifier: string;
	value: string;
	expiresAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface GetFavouritesResponse extends GetPlaceResponse {}

export interface GetProfileFavouritesResponse {
	data: GetPlaceResponse[];
	hasMore: boolean;
	total: number;
}

export interface GetProfileReviewsResponse {
	data: {
		content: string;
		createdAt: string;
		dogBreeds: string[];
		id: string;
		images: OptimizedReviewImage[];
		isFirstVisit: boolean;
		likesCount: number;
		numDogs: number;
		place: GetPlaceResponse;
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

export interface ProfileReview {
	content: string;
	createdAt: string;
	dogBreeds: string[];
	id: string;
	images: OptimizedReviewImage[];
	isFirstVisit: boolean;
	likesCount: number;
	numDogs: number;
	place: GetPlaceResponse;
	placeId: string;
	rating: number;
	timeOfVisit: string;
	title: string;
	updatedAt: string;
	userId: string;
	visitDate: string;
}

export interface ProfileStats {
	reviewCount: number;
	favouriteCount: number;
	memberSince: string;
}
