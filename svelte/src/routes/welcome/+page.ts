// +page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { session } = await parent();
    
    if (!session) {
        console.log('No session, redirecting to sign-in');
        throw redirect(303, '/sign-in');
    }
    
    return {
        data: {
            session,
        }
    };
};