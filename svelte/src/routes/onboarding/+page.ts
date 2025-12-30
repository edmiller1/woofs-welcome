import { getBusinessByOwnerId } from '$lib/api/business/getBusinessByOwnerId';
import { getUser } from '$lib/auth/guard';
import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ url }) => {
	const user = await getUser();
	const searchParams = url.searchParams;
	const redirectTo = searchParams.get('redirect') || '/';

	if (!user) {
		throw redirect(302, '/sign-in');
	}

	const isBusiness = searchParams.get('business') === 'true';

	if (isBusiness) {
		const needsPersonalProfile = !user.name || !user.image;
		if (needsPersonalProfile) {
			throw redirect(302, '/welcome?business=true');
		}

		const hasBusiness = await getBusinessByOwnerId(user.id);

		if (hasBusiness.exists) {
			throw redirect(302, '/business/dashboard');
		} else {
			throw redirect(302, '/business/setup');
		}
	} else {
		const needsPersonalProfile = !user.name || !user.image;
		if (needsPersonalProfile) {
			throw redirect(302, '/welcome');
		}

		// Profile complete, go to home
		throw redirect(302, '/explore');
	}
};
