<script lang="ts">
	import { api } from '$lib/api/index.js';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import { getNameFromSlug } from '$lib/helpers/index.js';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import Footer from '$lib/components/footer.svelte';
	import {
		ArrowRight,
		BadgeCheck,
		Bubbles,
		Footprints,
		Heart,
		Hotel,
		LoaderCircle,
		MapPin,
		MapPinHouse,
		PartyPopper,
		ShoppingBag,
		Sparkles,
		Star,
		UtensilsCrossed
	} from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import ErrorBoundary from '$lib/components/error-boundary.svelte';
	import { generateKeywords, getAbsoluteUrl } from '$lib/seo/metadata.js';
	import { getBreadcrumbSchema, getOrganizationSchema } from '$lib/seo/structured-data.js';
	import SeoHead from '$lib/components/seo-head.svelte';
	import Navbar from '$lib/components/navbar.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import PlaceCardSingleImage from '$lib/components/place-card-single-image.svelte';
	import { toast } from 'svelte-sonner';
	import { authModalActions } from '$lib/auth/auth-modal-store.js';

	let { data } = $props();
	const user = $derived(data.user);

	const queryClient = useQueryClient();

	const island = createQuery({
		queryKey: ['island', data.slug],
		queryFn: () => api.island.getIsland(data.slug)
	});

	// Generate SEO metadata
	const metadata = $derived.by(() => {
		if (!$island.data) {
			return {
				title: 'Loading...',
				description: 'Loading region information...'
			};
		}

		const i = $island.data;
		const title = `Dog Friendly Places in ${i.name}, New Zealand`;
		const description = `Discover the best dog-friendly cafes, restaurants, parks, and beaches in ${i.name}. Read reviews from dog owners and find your next adventure with your furry friend.`;

		const keywords = generateKeywords(`${i.name} dog friendly`, [
			`dog friendly ${i.name}`,
			`${i.name} dogs allowed`,
			`pet friendly ${i.name}`,
			`${i.name} cafes dogs`,
			`${i.name} restaurants dogs`,
			`${i.name} parks dogs`
		]);

		return {
			title,
			description,
			keywords,
			image: i.image,
			url: getAbsoluteUrl(window.location.pathname),
			type: 'website' as const
		};
	});

	// Generate structured data
	const structuredData = $derived.by(() => {
		if (!$island.data) return [];

		const schemas = [];

		// Organization schema
		schemas.push(getOrganizationSchema());

		// Breadcrumb schema
		const breadcrumbs = [
			{ name: 'Home', url: getAbsoluteUrl('/') },
			{
				name: $island.data.name || 'New Zealand',
				url: getAbsoluteUrl(`/island/${$island.data.slug}`)
			},
			{ name: $island.data.name, url: getAbsoluteUrl(window.location.pathname) }
		];
		schemas.push(getBreadcrumbSchema(breadcrumbs));

		return schemas;
	});

	const mainPopularPlaces = $derived($island.data?.popularPlaces.slice(0, 2) || []);
	const popularPlaces = $derived($island.data?.popularPlaces.slice(2) || []);
	const currentPlaceFilter = $derived(page.url.searchParams.get('placeSort') ?? 'popular');
	const currentEventFilter = $derived(page.url.searchParams.get('eventSort') ?? 'new');

	let pendingFavouritePlaceId = $state<string | null>(null);

	const islandPlacesAndEvents = $derived(
		createQuery({
			queryKey: ['islandPlacesAndEvents', data.slug, currentPlaceFilter, currentEventFilter],
			queryFn: () =>
				api.island.getIslandPlacesAndEvents(data.slug, {
					placeSort: currentPlaceFilter,
					eventSort: currentEventFilter
				})
		})
	);

	const favouritePlace = createMutation({
		mutationFn: api.place.favouritePlace,
		onMutate: (placeId) => {
			pendingFavouritePlaceId = placeId;
		},
		onSuccess: (result) => {
			toast.success(`Place ${result.action === 'added' ? 'added to' : 'removed from'} favourites`);
			queryClient.invalidateQueries({
				queryKey: ['island', data.slug]
			});
			invalidateAll();
		},
		onError: (error) => {
			toast.error(`Operation failed: ${error.message}`);
		},
		onSettled: () => {
			pendingFavouritePlaceId = null;
		}
	});

	const openAuthModal = () => {
		authModalActions.open('sign-in');
	};

	const handleFavouriteClick = (placeId: string) => {
		if (!data.user) {
			openAuthModal();
			return;
		}

		$favouritePlace.mutate(placeId);
	};

	// Function to update place filter
	function setPlaceFilter(filter: string) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('placeSort', filter);
		goto(`?${params.toString()}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true // don't add to browser history (might change later)
		});
	}

	// Function to update event filter (for later)
	function setEventFilter(filter: string) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('eventSort', filter);
		goto(`?${params.toString()}`, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
</script>

<SeoHead {metadata} {structuredData} />

<ErrorBoundary error={$island.error}>
	{#if $island.isLoading}
		<div class="flex min-h-screen items-center justify-center">
			<LoaderCircle class="text-primary size-10 animate-spin" />
		</div>
	{/if}

	{#if $island.isSuccess}
		<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
			<Navbar {user} currentPlace={getNameFromSlug(data.slug)} />
			<div class="py-2 lg:flex lg:items-center lg:justify-between">
				<div class="min-w-0 flex-1">
					<Breadcrumbs type="island" islandName={$island.data.name} />
					<h2
						class="mt-4 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
					>
						{$island.data.name}
					</h2>
					<div class="text-muted-foreground mt-2 flex h-4 flex-wrap items-center space-x-2 text-sm">
						<p class="flex items-center">
							<MapPin class="mr-1 h-4 w-4" />
							{$island.data.stats.totalPlaces} places
						</p>
						<Separator orientation="vertical" />
						<p class="flex items-center">
							<Footprints class="mr-1 h-4 w-4" />
							{$island.data.stats.totalAdventures} adventures
						</p>
						<Separator orientation="vertical" />
						<p class="flex items-center">
							<UtensilsCrossed class="mr-1 h-4 w-4" />
							{$island.data.stats.totalEats} eats
						</p>
						<Separator orientation="vertical" />
						<p class="flex items-center">
							<Hotel class="mr-1 h-4 w-4" />
							{$island.data.stats.totalStays} stays
						</p>
						<Separator orientation="vertical" />
						<p class="flex items-center">
							<ShoppingBag class="mr-1 h-4 w-4" />
							{$island.data.stats.totalStores} stores
						</p>
					</div>
					<div class="min-width-full relative my-5 flex justify-center">
						<img
							src={$island.data.optimizedImage.src}
							srcset={$island.data.optimizedImage.srcset}
							sizes={$island.data.optimizedImage.sizes}
							alt={$island.data.name}
							class="h-[30rem] w-full rounded-lg object-cover object-center"
							loading="lazy"
						/>
					</div>
					<section class="mx-auto mt-20 w-full max-w-7xl rounded-lg border p-4">
						<!-- Header -->
						<div class="mb-6 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Star class="size-7 fill-yellow-500 text-yellow-500" />
								<h2 class="text-2xl font-bold">Popular Places in the {$island.data.name}</h2>
							</div>
							<a
								href={`/explore?location=${$island.data.name.toLowerCase()}&minRating=4`}
								class="hover:underline">View all</a
							>
						</div>

						<!-- Popular Places first 2 -->
						<div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
							{#each mainPopularPlaces as place}
								<a href={`/place/${place.slug}`}>
									<div class="group cursor-pointer overflow-hidden rounded-lg border">
										<div class="relative aspect-video overflow-hidden">
											<img
												src={place.imageUrl.webp.src}
												alt={place.name}
												class="object-cover transition-transform duration-300 group-hover:scale-105"
												srcset={place.imageUrl.srcset}
											/>
											<!-- Heart Button -->
											<div class="absolute right-2 top-2 z-10">
												<Button
													variant="ghost"
													size="icon"
													class="rounded-full bg-white/80 hover:bg-white"
													onclick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleFavouriteClick(place.id);
													}}
												>
													{#if $favouritePlace.isPending && pendingFavouritePlaceId === place.id}
														<LoaderCircle class="size-6 animate-spin" />
													{:else}
														<Heart
															class={`size-6 ${place.hasFavourited ? 'fill-rose-500 text-rose-500' : ''}`}
														/>
													{/if}
												</Button>
											</div>
										</div>
										<div class="rounded-lg p-4">
											<div class="flex items-center gap-2">
												<h3 class="line-clamp-1 text-lg font-semibold">
													{place.name}
												</h3>
												{#if place.isVerified}
													<BadgeCheck class="fill-primary size-4" />
												{/if}
											</div>
											<div class="text-muted-foreground mb-2 flex items-center gap-3 text-sm">
												<span>{place.cityName}, {place.regionName}</span>
												<div class="flex items-center gap-1">
													<Star class="fill-muted-foreground size-3" />
													<span>{place.rating}</span>
												</div>
											</div>
											{#if place.description}
												<p class="text-muted-foreground line-clamp-2 text-sm">
													{place.description}
												</p>
											{/if}
										</div>
									</div>
								</a>
							{/each}
						</div>

						<!-- Popular Places -->
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
							{#each popularPlaces as place}
								<a href={`/place/${place.slug}`}>
									<div class="group cursor-pointer overflow-hidden rounded-md border">
										<div class="relative aspect-video overflow-hidden">
											<img
												src={place.imageUrl.webp.src}
												alt={place.name}
												class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												srcset={place.imageUrl.srcset}
											/>
											<!-- Heart Button -->
											<div class="absolute right-2 top-2 z-10">
												<Button
													variant="ghost"
													size="icon"
													class="rounded-full bg-white/80 hover:bg-white"
													onclick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleFavouriteClick(place.id);
													}}
												>
													{#if $favouritePlace.isPending && pendingFavouritePlaceId === place.id}
														<LoaderCircle class="size-6 animate-spin" />
													{:else}
														<Heart
															class={`size-6 ${place.hasFavourited ? 'fill-rose-500 text-rose-500' : ''}`}
														/>
													{/if}
												</Button>
											</div>
										</div>
										<div class="p-3">
											<div class="flex items-center gap-2">
												<h3 class="line-clamp-1 text-lg font-semibold">
													{place.name}
												</h3>
												{#if place.isVerified}
													<BadgeCheck class="fill-primary size-4" />
												{/if}
											</div>
											<div class="text-muted-foreground flex items-center gap-2 text-xs">
												<span>{place.cityName}, {place.regionName}</span>
												<div class="flex items-center gap-1">
													<Star class="fill-muted-foreground size-3" />
													<span>{place.rating}</span>
												</div>
											</div>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</section>

					<!-- Premium Banner -->
					<div
						class="relative my-20 flex h-64 w-full items-center rounded-xl border border-[#bee9a6] bg-[#fafdf8] px-8"
					>
						<div class="text-secondary flex w-full items-center justify-between">
							<div class="flex items-center gap-5">
								<div class="flex-shrink-0">
									<Sparkles class="size-12" />
								</div>
								<div class="flex flex-col gap-2">
									<h2 class="text-4xl font-semibold">
										Claim your business with <span class="text-primary">premium</span>
									</h2>
									<p class="text-lg">
										Upgrade to <span class="text-primary font-semibold">premium</span> to claim, create,
										manage events and adverts for your businesses.
									</p>
								</div>
							</div>
							<Button variant="secondary" size="lg"
								>Go Premium <ArrowRight class="h-4 w-4" /></Button
							>
						</div>
					</div>

					<!-- Places Filter -->
					<section>
						<div>
							<div class="flex items-center justify-between gap-2 border-b">
								<div class="mb-2 flex items-center justify-between gap-2">
									<MapPinHouse />
									<h2 class="text-2xl font-bold">Places in the {$island.data.name}</h2>
								</div>
								<a
									href={`/explore?location=${$island.data.name.toLowerCase()}`}
									class="hover:underline">View all</a
								>
							</div>
							<div class="mb-2 mt-3 flex items-center gap-2">
								<Button
									variant={currentPlaceFilter === 'popular' ? 'default' : 'outline'}
									size="sm"
									onclick={() => setPlaceFilter('popular')}
								>
									<Star />Popular
								</Button>
								<Button
									variant={currentPlaceFilter === 'new' ? 'default' : 'outline'}
									size="sm"
									onclick={() => setPlaceFilter('new')}
								>
									<Bubbles />New
								</Button>
								<Button
									variant={currentPlaceFilter === 'verified' ? 'default' : 'outline'}
									size="sm"
									onclick={() => setPlaceFilter('verified')}
								>
									<BadgeCheck />Verified
								</Button>
								<Button
									variant={currentPlaceFilter === 'surprise' ? 'default' : 'outline'}
									size="sm"
									onclick={() => setPlaceFilter('surprise')}
								>
									<PartyPopper /> Surprise
								</Button>
							</div>
						</div>
						{#if $islandPlacesAndEvents.data?.places && $islandPlacesAndEvents.data?.places.length > 0}
							<div class="my-5 grid grid-cols-4 gap-4">
								{#each $islandPlacesAndEvents.data.places as place}
									<PlaceCardSingleImage {place} onFavouriteClick={handleFavouriteClick} />
								{/each}
							</div>
							{#if $islandPlacesAndEvents.data.places.length === 20}
								<div class="mb-5 flex w-full items-center justify-center">
									{#if currentPlaceFilter === 'popular'}
										<a
											href={`/explore?location=${$island.data.name.toLowerCase()}&minRating=4`}
											class="hover:underline"
										>
											<Button>View More</Button>
										</a>
									{:else if currentPlaceFilter === 'new'}
										<a
											href={`/explore?location=${$island.data.name.toLowerCase()}&isNew=true`}
											class="hover:underline"
										>
											<Button>View More</Button>
										</a>
									{:else if currentPlaceFilter === 'verified'}
										<a
											href={`/explore?location=${$island.data.name.toLowerCase()}&isVerified=true`}
											class="hover:underline"
										>
											<Button>View More</Button>
										</a>
									{/if}
								</div>
							{/if}
						{:else if $islandPlacesAndEvents.isLoading}
							<div class="flex min-h-[200px] w-full items-center justify-center">
								<LoaderCircle class="text-primary size-10 animate-spin" />
							</div>
						{:else}
							<p class="text-center text-gray-500">No places found in this island.</p>
						{/if}
					</section>

					<!-- Events section -->
					<!-- <section class="my-20">
						<div class="flex items-center justify-between gap-2 border-b">
							<div class="mb-2 flex items-center justify-between gap-2">
								<Ticket />
								<h2 class="text-2xl font-bold">Events in the {$island.data.name}</h2>
							</div>
							<a href="/" class="hover:underline">View all</a>
						</div>
						<div class="mb-2 mt-3 flex items-center gap-2">
							<Button variant="outline" size="sm"><Bubbles />New</Button>
							<Button variant="outline" size="sm"><CalendarClock />Upcoming</Button>
							<Button variant="outline" size="sm">
								<PartyPopper /> Surprise
							</Button>
						</div>
					</section> -->
				</div>
			</div>
			<Footer />
		</div>
	{/if}
</ErrorBoundary>
