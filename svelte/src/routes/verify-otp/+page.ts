import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
    const { session, supabase } = await parent();
    const searchParams = url.searchParams;

    if(!searchParams.has('email')) {
        throw redirect(303, '/sign-in');
    }
    return {
        searchParams: Object.fromEntries(searchParams.entries()),
        session,
        supabase
    };
}