<script lang="ts">
	import { api } from '$lib/api/index.js';
	import { House, Loader2, MapPin, Mountain, UtensilsCrossed, Star } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MainNavbar from '$lib/components/main-navbar.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import CityCarousel from '$lib/components/city-carousel.svelte';
	import PlaceCard from '$lib/components/place-card.svelte';
	import { region } from '$lib/api/region/index.js';

	let { data } = $props();
	const user = $derived(data.user);

	const city = createQuery({
		queryKey: ['city', data.slug],
		queryFn: () => api.city.getCity(data.slug)
	});
</script>

{#if $city.isError}
	<div>Error</div>
{/if}

{#if $city.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="text-primary size-10 animate-spin" />
	</div>
{/if}

{#if $city.isSuccess}
	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
		<MainNavbar {user} currentPlace={$city.data.city.name} />
		<div class="py-2 lg:flex lg:items-center lg:justify-between">
			<div class="min-w-0 flex-1">
				<Breadcrumbs
					type="region"
					islandName={$city.data.city.name}
					regionName={$city.data.city.name}
				/>
			</div>
		</div>
	</div>
{/if}
