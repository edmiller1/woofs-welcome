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

	let { data } = $props();
	const user = $derived(data.user);

	const region = createQuery({
		queryKey: ['region', data.slug],
		queryFn: () => api.region.getRegion(data.slug)
	});
</script>

{#if $region.isError}
	<div>Error</div>
{/if}

{#if $region.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="text-primary size-10 animate-spin" />
	</div>
{/if}

{#if $region.isSuccess}
	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
		<MainNavbar {user} currentPlace={$region.data.region.name} />
		<div class="py-2 lg:flex lg:items-center lg:justify-between">
			<div class="min-w-0 flex-1">
				<Breadcrumbs
					type="region"
					islandName={$region.data.region.island.name}
					regionName={$region.data.region.name}
				/>
				<h2
					class="mt-4 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
				>
					{$region.data.region.name}
				</h2>
				<div class="mt-1 flex sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
					<div class="text-muted-foreground mt-2 flex items-center text-sm">
						<MapPin class="mr-1 size-4" />
						{$region.data.stats.totalStores} Shopping Spots
					</div>
					<div class="text-muted-foreground mt-2 flex items-center text-sm">
						<Mountain class="mr-1 size-4" />
						{$region.data.stats.totalAdventures} Outdoor Adventures
					</div>
					<div class="text-muted-foreground mt-2 flex items-center text-sm">
						<House class="mr-1 size-4" />
						{$region.data.stats.totalStays} Places to Stay
					</div>
					<div class="text-muted-foreground mt-2 flex items-center text-sm">
						<UtensilsCrossed class="mr-1 size-4" />
						{$region.data.stats.totalEats} Restaurants & Cafes
					</div>
				</div>
				<div class="relative my-5 flex min-w-full justify-center">
					<img
						src={$region.data.region.image}
						alt={$region.data.region.name}
						class="h-[30rem] w-full rounded-lg object-cover object-center"
					/>
				</div>
				<div class="my-3">
					<h2 class="text-2xl font-semibold">Explore the {$region.data.region.name} region</h2>
					<Card.Root class="my-3">
						<div class="flex min-w-full px-5">
							<div class="w-1/6">
								<img
									src={$region.data.region.image}
									alt={$region.data.region.name}
									class="h-40 w-40 rounded-lg object-cover object-center"
								/>
							</div>
							<div class="flex w-5/6 flex-col gap-5 py-5">
								<span class="text-lg font-semibold">
									Explore our top picks in {$region.data.region.name}
								</span>
								<div class="flex items-end">
									<Button variant="outline">Explore now</Button>
								</div>
							</div>
						</div>
					</Card.Root>
				</div>

				<!-- Food -->
				<div class="mt-10">
					<div class="flex w-full items-center justify-between">
						<h2 class="my-3 text-xl font-semibold">Food and Drink</h2>
						<a
							href={`/explore?type=${$region.data.foodSpots.map((spot) => spot.types)[0]}&type=bar&type=restaurant&region=${$region.data.region.name}`}
							class={buttonVariants({ variant: 'link' })}>View more</a
						>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
						{#each $region.data.foodSpots as place}
							<PlaceCard {place} />
						{/each}
					</div>
				</div>

				<!-- Stays -->
				<div class="mt-10">
					<div class="flex w-full items-center justify-between">
						<h2 class="my-3 text-xl font-semibold">Places to Stay</h2>
						<a
							href={`/explore?type=${$region.data.stays.map((spot) => spot.types)[0]}&type=hotel&type=motel&type=airbnb&region=${$region.data.region.name}`}
							class={buttonVariants({ variant: 'link' })}>View more</a
						>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
						{#each $region.data.stays as place}
							<PlaceCard {place} />
						{/each}
					</div>
				</div>

				<!-- Adventures -->
				<div class="mt-10">
					<div class="flex w-full items-center justify-between">
						<h2 class="my-3 text-xl font-semibold">Outdoor Adventures</h2>
						<a
							href={`/explore?type=${$region.data.adventures.map((spot) => spot.types)[0]}&type=trail&type=hike&type=walk&type=lake&type=river&region=${$region.data.region.name}`}
							class={buttonVariants({ variant: 'link' })}>View more</a
						>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
						{#each $region.data.adventures as place}
							<PlaceCard {place} />
						{/each}
					</div>
				</div>

				<!-- Retail Places -->
				<div class="mt-10">
					<div class="flex w-full items-center justify-between">
						<h2 class="my-3 text-xl font-semibold">Exceptional Shopping</h2>
						<a
							href={`/explore?type=${$region.data.retailPlaces.map((spot) => spot.types)[0]}&type=trail&type=hike&type=walk&type=lake&type=river&region=${$region.data.region.name}`}
							class={buttonVariants({ variant: 'link' })}>View more</a
						>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
						{#each $region.data.retailPlaces as place}
							<PlaceCard {place} />
						{/each}
					</div>
				</div>

				<div class="my-10">
					<CityCarousel
						heading="Popular Cities to visit in the {$region.data.region.name} region"
						cities={$region.data.cities}
					/>
				</div>
			</div>
		</div>
	</div>
	<Footer />
{/if}
