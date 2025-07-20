<script lang="ts">
	import { api } from '$lib/api/index.js';
	import { Heart, House, Loader2, MapPin, Mountain, UtensilsCrossed } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MainNavbar from '$lib/components/main-navbar.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';

	let { data } = $props();
	const user = $derived(data.user);

	const region = createQuery({
		queryKey: ['region', data.slug],
		queryFn: () => api.region.getRegion(data.slug)
	});

	//Carousel
	let carouselApi = $state<CarouselAPI>();
	let current = $state<number>(0);

	$effect(() => {
		if (carouselApi) {
			current = carouselApi.scrollSnapList().length;
			carouselApi.on('select', () => {
				current = carouselApi!.selectedScrollSnap();
			});
		}
	});

	const goToImage = (index: number) => {
		carouselApi!.scrollTo(index);
		current = index;
	};
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
				<div class="min-width-full relative my-5 flex justify-center">
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
				{#each $region.data.cities as city}
					<div class="mt-10">
						<div class="flex w-full items-center justify-between">
							<h2 class="my-3 text-xl font-semibold">{city.name}</h2>
							<a href={`/city/${city.slug}`} class="text-sm hover:underline">View more</a>
						</div>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
							{#each city.places as place}
								<a href="/places/{place.slug}" class="block">
									<div
										class="m-0 flex h-full w-64 max-w-sm cursor-pointer flex-col overflow-hidden rounded-lg p-0 shadow-lg"
									>
										<div class="relative">
											<Carousel.Root
												setApi={(emblaApi) => (carouselApi = emblaApi)}
												class="size-64"
											>
												<Carousel.Content class="-ml-0">
													{#each place.images as image}
														<Carousel.Item class="pl-0">
															<div class="relative aspect-[4/3]">
																<img
																	src={image.url}
																	alt={image.altText}
																	class="size-64 object-cover object-center"
																/>
															</div>
														</Carousel.Item>
													{/each}
												</Carousel.Content>
												<!-- Indicators -->
												<div
													class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2"
												>
													{#each place.images as _, index}
														{@const isActive = current === index}
														<button
															class="h-2 w-2 cursor-pointer rounded-full bg-white {isActive
																? 'opacity-100'
																: 'opacity-60'}"
															onclick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																goToImage(index);
															}}
															aria-label="image-indicator"
														></button>
													{/each}
												</div>
											</Carousel.Root>
											<Button
												variant="secondary"
												size="icon"
												class="absolute right-4 top-4 rounded-full bg-white/90 shadow-md transition-transform hover:scale-105 hover:bg-white"
												onclick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													console.log('Heart clicked for place:', place.name);
												}}
											>
												<Heart class="size-4" />
											</Button>
										</div>
										<div class="space-y-3 p-2">
											<h3 class="text-sm leading-tight">
												{place.name}
											</h3>
											<div class="flex items-center gap-1">
												{#each place.types as type}
													<Badge class="rounded-full">{type}</Badge>
												{/each}
											</div>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<Footer />
{/if}
