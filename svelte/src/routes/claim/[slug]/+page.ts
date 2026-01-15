import { browser } from '$app/environment';
import { api } from '$lib/api';
import { getUser } from '$lib/auth/guard';
import { contextStore } from '$lib/stores/context';
import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ params, url }) => {
	const user = await getUser();
	const { slug } = params;
	const searchParams = url.searchParams;

	const checkEligibility = async () => {
		try {
			const result = await api.claim.checkClaimEligibility(slug!);
			const eligibilityData = result;

			return {
				canClaim: eligibilityData.canClaim,
				reason: eligibilityData.reason
			};
		} catch (error) {
			console.error(error);
		}
	};
	if (browser) {
		if (!user) {
			throw redirect(307, `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`);
		}

		if (user.business && user.activeContext === 'personal') {
			contextStore.setContext('business');
		}

		// Check if eligible
		const claimData = await checkEligibility();

		if (!claimData?.canClaim) {
			throw redirect(
				307,
				`/claim/${slug}?error=true&reason=${encodeURIComponent(claimData?.reason || '')}`
			);
		}
	}

	return {
		user,
		slug,
		searchParams: Object.fromEntries(searchParams.entries())
	};
};
