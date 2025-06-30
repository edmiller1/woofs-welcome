<script>
	import { auth } from '$lib/auth/stores.js';
	import Navbar from '$lib/components/navbar.svelte';
	import PlaceFilters from '$lib/components/place-filters.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();
	const user = $derived(data.user);

	// onMount(() => {
	// 	if (!user) {
	// 		auth.displayOneTap();
	// 	}
	// });
</script>

<div class="bg-background min-h-screen">
	<Navbar {user} />
	<PlaceFilters />
</div>
