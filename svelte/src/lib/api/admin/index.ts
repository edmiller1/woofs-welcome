import { protectedProcedure } from '$lib/axios';
import type { ClaimStatus, ClaimWithDetails } from '$lib/types/claim';
import type { ReviewReport } from '$lib/types/admin';

// ============================================
// CLAIMS
// ============================================

export interface AdminClaimsResponse {
	success: boolean;
	data: ClaimWithDetails[];
}

export const getAdminClaims = async (status?: ClaimStatus) => {
	const response = await protectedProcedure.get<ClaimWithDetails[]>('/claim/admin/all', {
		params: status ? { status } : undefined
	});
	return response.data;
};

export const getAdminPendingClaims = async () => {
	const response = await protectedProcedure.get<AdminClaimsResponse>('/claim/admin/pending');
	return response.data;
};

export const approveClaim = async (claimId: string) => {
	const response = await protectedProcedure.post<{ success: boolean }>(
		`/claim/admin/${claimId}/approve`
	);
	return response.data;
};

export const rejectClaim = async (claimId: string, rejectionReason: string) => {
	const response = await protectedProcedure.post<{ success: boolean }>(
		`/claim/admin/${claimId}/reject`,
		{ rejectionReason }
	);
	return response.data;
};

// ============================================
// REPORTS
// ============================================

export const getAdminReports = async (status?: string) => {
	const response = await protectedProcedure.get<ReviewReport[]>('/admin/reports', {
		params: status ? { status } : undefined
	});
	return response.data;
};

export const resolveReport = async (reportId: string, action: 'approve' | 'reject') => {
	const response = await protectedProcedure.post<{ success: boolean }>(
		`/admin/reports/${reportId}/${action}`
	);
	return response.data;
};

// ============================================
// STATS
// ============================================

export interface AdminStats {
	pendingClaims: number;
	pendingReports: number;
	totalUsers: number;
	totalPlaces: number;
	totalReviews: number;
}

export const getAdminStats = async () => {
	const response = await protectedProcedure.get<AdminStats>('/admin/stats');
	return response.data;
};

export const admin = {
	getAdminClaims,
	getAdminPendingClaims,
	approveClaim,
	rejectClaim,
	getAdminReports,
	resolveReport,
	getAdminStats
};
