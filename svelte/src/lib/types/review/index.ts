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
		image?: string | null;
	};
	images: OptimizedReviewImage[];
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

export interface OptimizedReviewImage extends ReviewImage {
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

export interface ReviewLike {
	id: string;
	reviewId: string;
	userId: string;
	createdAt: string;
}

export interface ReviewReport {
	id: string;
	reviewId: string;
	userId: string;
	reason: string;
	details: string;
	status: string;
	reviewedAt: string;
	reviewedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface DogBreed {
	id: string;
	name: string;
	createdAt: string;
}

export interface CreateReviewResponse {
	success: boolean;
	placeId: string;
	placeSlug: string;
	reviewId: string;
	message: string;
	error?: string;
}

export interface GetDogBreedsResponse {
	breeds: DogBreed[];
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
