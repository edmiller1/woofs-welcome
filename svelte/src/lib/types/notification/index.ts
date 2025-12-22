export interface NotificationPreferences {
	email: {
		reviewReplies: boolean;
		reviewLikes: boolean;
		newReviewsOnFavourites: boolean;
		placeUpdates: boolean;
		claimStatus: boolean;
		reportStatus: boolean;
		weeklyDigest: boolean;
		marketing: boolean;
		newsletter: boolean;
	};
	push: {
		reviewReplies: boolean;
		reviewLikes: boolean;
		newReviewsOnFavourites: boolean;
		nearbyPlaces: boolean;
		favourites: boolean;
		claimStatus: boolean;
	};
}

export interface NotificationPreferencesInput {
	email?:
		| {
				reviewReplies?: boolean | undefined;
				reviewLikes?: boolean | undefined;
				newReviewsOnFavourites?: boolean | undefined;
				placeUpdates?: boolean | undefined;
				claimStatus?: boolean | undefined;
				reportStatus?: boolean | undefined;
				weeklyDigest?: boolean | undefined;
				marketing?: boolean | undefined;
				newsletter?: boolean | undefined;
		  }
		| undefined;
	push?:
		| {
				reviewReplies?: boolean | undefined;
				reviewLikes?: boolean | undefined;
				newReviewsOnFavourites?: boolean | undefined;
				claimStatus?: boolean | undefined;
				nearbyPlaces?: boolean | undefined;
				favourites?: boolean | undefined;
		  }
		| undefined;
}
