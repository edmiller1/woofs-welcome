import { getUser } from '$lib/auth/guard';

export const load = async () => {
    const user = await getUser();

    return {
        user
    }
}