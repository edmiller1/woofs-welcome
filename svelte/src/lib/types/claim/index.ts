export type ClaimRole = 'Owner' | 'Manager' | 'Marketing Manager' | 'Staff' | 'Other';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Claim {
	id: string;
	placeId: string;
	userId: string;
	businessId: string;
	status: ClaimStatus;
	businessEmail: string;
	businessPhone: string;
	role: ClaimRole;
	verificationDocuments: string[] | null;
	reviewedBy: string | null;
	reviewedAt: string | null;
	rejectionReason: string | null;
	claimedAt: string;
	approvedAt: string | null;
	additionalNotes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ClaimWithDetails extends Claim {
	place: {
		id: string;
		name: string;
		slug: string;
		address: string | null;
		images: Array<{
			url: string;
			altText: string | null;
			src: string;
			srcset: string;
			sizes: string;
			responsive: {
				xs: string;
				sm: string;
				md: string;
				lg: string;
				xl: string;
				'2xl': string;
			};
			webp: {
				src: string;
				srcset: string;
			};
		}>;
	};
	business: {
		id: string;
		name: string;
		email: string | null;
	};
}

export interface ClaimEligibility {
	canClaim: boolean;
	reason: string | null;
	claimedAt?: string | null;
	pendingClaimId?: string;
}

export interface SubmitClaimInput {
	placeSlug: string;
	businessId: string;
	businessEmail: string;
	businessPhone: string;
	role: ClaimRole;
	additionalNotes?: string;
	verificationDocuments: Array<{ data: string; fileName: string }>;
}

export interface UploadDocumentsInput {
	claimId: string;
	files: File[];
}
