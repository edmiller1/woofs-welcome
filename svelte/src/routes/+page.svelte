<script>
	import { browser } from '$app/environment';
	import { api } from '$lib/api/index.js';
	import { auth } from '$lib/auth/stores.js';
	import Navbar from '$lib/components/navbar.svelte';
	import PlaceFilters from '$lib/components/place-filters.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';

	let { data } = $props();
	const user = $derived(data.user);

	// onMount(() => {
	// 	if (!user) {
	// 		auth.displayOneTap();
	// 	}
	// });

	const places = createQuery({
		queryKey: ['places'],
		queryFn: api.place.getPlaces,
		initialData: data.places
	});
</script>

<div class="bg-background min-h-screen">
	<Navbar {user} />
	<PlaceFilters />
	<div class="mx-10 mt-10">
		<h2 class="text-xl font-semibold">Places to explore</h2>
		<div class="text-muted-foreground font-light">Bring your furry companions</div>
		<div>
			<ul class="m-0 flex list-none items-center p-0">
				<li>
					<div class="relative"></div>
				</li>
			</ul>
		</div>
	</div>
</div>
