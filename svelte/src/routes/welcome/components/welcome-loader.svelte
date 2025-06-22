<script lang="ts">
	import { goto } from '$app/navigation';
	import { createUser } from '$lib/api/auth/createUser';
	import { useQuery } from '@sveltestack/svelte-query';
	import LottieAnimation from '$lib/components/lottie-animation.svelte';
	import welcomeAnimation from '$lib/lottie/welcome.json';
	import type { Session } from '@supabase/supabase-js';

	// Receive session as a prop
	let { session }: { session: Session | null } = $props();

	console.log('WelcomeLoader - received session:', session);

	const queryResult = useQuery('welcome', () => createUser(session?.access_token), {
		refetchInterval: (query) => {
			return query?.isSynced ? false : 1000;
		},
		enabled: !!session?.access_token
	});

	$effect(() => {
		if ($queryResult.data?.isSynced) {
			goto($queryResult.data.redirectUrl);
		}
	});
</script>

<div class="flex flex-col items-center justify-center">
	<LottieAnimation animationData={welcomeAnimation} loop autoplay />
	<h1 class="text-xl sm:text-2xl">One moment while we sign you in...</h1>
</div>
