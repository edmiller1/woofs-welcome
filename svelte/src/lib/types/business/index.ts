export interface Business {
	id: string;
	ownerId: string;
	name: string;
	email: string;
	phone: string | null;
	website: string;
	description: string;
	logoUrl: string | null;
	logoPublicId: string | null;
	verified: boolean;
	verifiedAt: string;
	subscriptionTier: string;
	subscriptionExpiresAt: string;
	createdAt: string;
	updatedAt: string;
}
