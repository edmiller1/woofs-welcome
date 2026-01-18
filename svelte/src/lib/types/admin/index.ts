export interface ReviewReport {
	id: string;
	reviewId: string;
	userId: string;
	reason: string;
	details: string | null;
	status: 'pending' | 'approved' | 'resolved' | 'rejected' | 'closed';
	reviewedAt: string | null;
	reviewedBy: string | null;
	createdAt: string;
	updatedAt: string;
	review?: {
		id: string;
		title: string;
		content: string | null;
		rating: number;
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
		};
		place: {
			id: string;
			name: string;
			slug: string;
		};
	};
	reporter?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface AdminStats {
	pendingClaims: number;
	pendingReports: number;
	totalUsers: number;
	totalPlaces: number;
	totalReviews: number;
}
