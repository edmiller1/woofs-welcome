<script lang="ts">
	import { api } from '$lib/api/index.js';
	import { House, MapPin, Mountain, UtensilsCrossed, LoaderCircle } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MainNavbar from '$lib/components/main-navbar.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import PlaceCard from '$lib/components/place-card.svelte';
	import ErrorBoundary from '$lib/components/error-boundary.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import { getBreadcrumbSchema, getOrganizationSchema } from '$lib/seo/structured-data';
	import { getAbsoluteUrl, generateKeywords } from '$lib/seo/metadata';

	let { data } = $props();
	const user = $derived(data.user);

	const city = createQuery({
		queryKey: ['city', data.slug],
		queryFn: () => api.city.getCity(data.slug)
	});

	// Generate SEO metadata
	const metadata = $derived.by(() => {
		if (!$city.data) {
			return {
				title: 'Loading...',
				description: 'Loading region information...'
			};
		}

		const c = $city.data;
		const title = `Dog Friendly Places in ${c.city.name}, New Zealand`;
		const description = `Discover the best dog-friendly cafes, restaurants, parks, and beaches in ${c.city.name}. Read reviews from dog owners and find your next adventure with your furry friend.`;

		const keywords = generateKeywords(`${c.city.name} dog friendly`, [
			`dog friendly ${c.city.name}`,
			`${c.city.name} dogs allowed`,
			`pet friendly ${c.city.name}`,
			`${c.city.name} cafes dogs`,
			`${c.city.name} restaurants dogs`,
			`${c.city.name} parks dogs`
		]);

		return {
			title,
			description,
			keywords,
			image: c.city.image,
			url: getAbsoluteUrl(window.location.pathname),
			type: 'website' as const
		};
	});

	// Generate structured data
	const structuredData = $derived.by(() => {
		if (!$city.data) return [];

		const schemas = [];

		// Organization schema
		schemas.push(getOrganizationSchema());

		// Breadcrumb schema
		const breadcrumbs = [
			{ name: 'Home', url: getAbsoluteUrl('/') },
			{
				name: $city.data.city.region.island?.name || 'New Zealand',
				url: getAbsoluteUrl(`/island/${$city.data.city.region.island?.slug}`)
			},
			{ name: $city.data.city.name, url: getAbsoluteUrl(window.location.pathname) }
		];
		schemas.push(getBreadcrumbSchema(breadcrumbs));

		return schemas;
	});
</script>

<SeoHead {metadata} {structuredData} />

<ErrorBoundary error={$city.error}>
	{#if $city.isLoading}
		<div class="flex min-h-screen items-center justify-center">
			<LoaderCircle class="text-primary size-10 animate-spin" />
		</div>
	{/if}

	{#if $city.isSuccess}
		<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
			<MainNavbar {user} currentPlace={$city.data.city.name} />
			<div class="py-2 lg:flex lg:items-center lg:justify-between">
				<div class="min-w-0 flex-1">
					<Breadcrumbs
						type="city"
						islandName={$city.data.city.region.island.name}
						regionName={$city.data.city.region.name}
						cityName={$city.data.city.name}
					/>
					<h2
						class="mt-4 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
					>
						{$city.data.city.name}
					</h2>
					<div class="mt-1 flex sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
						<div class="text-muted-foreground mt-2 flex items-center text-sm">
							<MapPin class="mr-1 size-4" />
							{$city.data.stats.totalStores} Shopping Spots
						</div>
						<div class="text-muted-foreground mt-2 flex items-center text-sm">
							<Mountain class="mr-1 size-4" />
							{$city.data.stats.totalAdventures} Outdoor Adventures
						</div>
						<div class="text-muted-foreground mt-2 flex items-center text-sm">
							<House class="mr-1 size-4" />
							{$city.data.stats.totalStays} Places to Stay
						</div>
						<div class="text-muted-foreground mt-2 flex items-center text-sm">
							<UtensilsCrossed class="mr-1 size-4" />
							{$city.data.stats.totalEats} Restaurants & Cafes
						</div>
					</div>
					<div class="relative my-5 flex min-w-full justify-center">
						<img
							src={$city.data.city.image}
							alt={$city.data.city.name}
							class="h-[30rem] w-full rounded-lg object-cover object-center"
						/>
					</div>
					<div class="my-3">
						<h2 class="text-2xl font-semibold">Explore the {$city.data.city.name} region</h2>
						<Card.Root class="my-3">
							<div class="flex min-w-full px-5">
								<div class="w-1/6">
									<img
										src={$city.data.city.image}
										alt={$city.data.city.name}
										class="h-40 w-40 rounded-lg object-cover object-center"
									/>
								</div>
								<div class="flex w-5/6 flex-col gap-5 py-5">
									<span class="text-lg font-semibold">
										Explore our top picks in {$city.data.city.name}
									</span>
									<div class="flex items-end">
										<Button variant="outline">Explore now</Button>
									</div>
								</div>
							</div>
						</Card.Root>
					</div>

					<!-- Food Spots -->
					<div class="my-10">
						<div class="my-2 flex w-full items-center justify-between">
							<h2 class="text-2xl font-semibold">Places to Eat</h2>
							<a
								href={`/explore?type=${$city.data.foodSpots.map((spot) => spot.types)[0]}&type=bar&type=restaurant&type=cafe&city=${$city.data.city.region.name}`}
								class={buttonVariants({ variant: 'link' })}>View more</a
							>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
							{#each $city.data.foodSpots as place}
								<PlaceCard {place} />
							{/each}
						</div>
					</div>

					<!-- Stays -->
					<div class="my-10">
						<div class="my-2 flex w-full items-center justify-between">
							<h2 class="text-2xl font-semibold">Places to Stay</h2>
							<a
								href={`/explore?type=${$city.data.stays.map((spot) => spot.types)[0]}&type=bar&type=restaurant&type=cafe&city=${$city.data.city.region.name}`}
								class={buttonVariants({ variant: 'link' })}>View more</a
							>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
							{#each $city.data.stays as place}
								<PlaceCard {place} />
							{/each}
						</div>
					</div>

					<!-- Adventures -->
					<div class="my-10">
						<div class="my-2 flex w-full items-center justify-between">
							<h2 class="text-2xl font-semibold">Adventures</h2>
							<a
								href={`/explore?type=${$city.data.adventures.map((spot) => spot.types)[0]}&type=bar&type=restaurant&type=cafe&city=${$city.data.city.region.name}`}
								class={buttonVariants({ variant: 'link' })}>View more</a
							>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
							{#each $city.data.adventures as place}
								<PlaceCard {place} />
							{/each}
						</div>
					</div>

					<!-- Retail -->
					<div class="my-10">
						<div class="my-2 flex w-full items-center justify-between">
							<h2 class="text-2xl font-semibold">Shopping</h2>
							<a
								href={`/explore?type=${$city.data.retail.map((spot) => spot.types)[0]}&type=bar&type=restaurant&type=cafe&city=${$city.data.city.region.name}`}
								class={buttonVariants({ variant: 'link' })}>View more</a
							>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
							{#each $city.data.retail as place}
								<PlaceCard {place} />
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
		<Footer />
	{/if}
</ErrorBoundary>
