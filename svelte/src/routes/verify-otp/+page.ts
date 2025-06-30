import { requireGuest } from '$lib/auth/guard';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
    const searchParams = url.searchParams;
    await requireGuest();

    if(!searchParams.has('email')) {
        throw redirect(303, '/sign-in');
    }
    return {
        searchParams: Object.fromEntries(searchParams.entries()),
    };
}