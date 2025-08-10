<script lang="ts">
	import { api } from '$lib/api/index.js';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import MainNavbar from '$lib/components/main-navbar.svelte';
	import { getNameFromSlug } from '$lib/helpers/index.js';
	import { Loader2 } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import RegionCarousel from '$lib/components/region-carousel.svelte';
	import CityCarousel from '$lib/components/city-carousel.svelte';
	import Footer from '$lib/components/footer.svelte';
	import PlaceCarousel from '$lib/components/place-carousel.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Heart, Star } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();
	const user = $derived(data.user);

	const island = createQuery({
		queryKey: ['island', data.slug],
		queryFn: () => api.island.getIsland(data.slug)
	});
</script>

{#if $island.isError}
	<div>Error</div>
{/if}

{#if $island.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="text-primary size-10 animate-spin" />
	</div>
{/if}

{#if $island.isSuccess}
	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
		<MainNavbar {user} currentPlace={getNameFromSlug(data.slug)} />
		<div class="py-2 lg:flex lg:items-center lg:justify-between">
			<div class="min-w-0 flex-1">
				<Breadcrumbs type="island" islandName={$island.data.name} />
				<h2
					class="mt-4 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
				>
					{$island.data.name}
				</h2>
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
				<RegionCarousel heading="Explore the {$island.data.name}" regions={$island.data.regions} />
				<!-- Claimed Places -->
				<div class="my-10">
					<h2 class="mb-4 text-2xl font-semibold">Explore our recommended places</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						{#each $island.data.verifiedPlaces as place}
							<div class="basis-[280px] pl-2 md:basis-[320px] md:pl-4">
								<Card.Root class="border-0 p-0 shadow-none" style="background-color: #f0d3ef;">
									<div
										class="group relative cursor-pointer rounded-xl p-4"
										style="background-color: #f0d3ef;"
									>
										<a
											href={`/place/${place.slug}`}
											class="block no-underline"
											aria-label={place.name}
										>
											<div class="relative aspect-[4/3] overflow-hidden rounded-xl">
												<img
													src={place.images[0].url}
													alt={place.name}
													srcset={place.images[0].url}
													sizes={place.images[0].url}
													loading="lazy"
													class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
												/>
											</div>
											<div class="space-y-1 pt-3">
												<div class="m-0 flex items-center justify-between">
													<h3 class="truncate font-medium text-gray-900">{place.name}</h3>
													<div class="flex items-center gap-1">
														<Star class="size-4" fill="#000000" />
														<span>{place.rating.toFixed(1)}</span>
													</div>
												</div>
												<div class="text-muted-foreground m-0 text-sm">
													{place.cityName}, {place.regionName}
												</div>
												<div class="mt-1 flex items-center gap-1">
													{#each place.types as type}
														<Badge class="rounded-full">{type}</Badge>
													{/each}
												</div>
											</div>
										</a>

										<div class="absolute right-5 top-5 z-10">
											<Button
												variant="ghost"
												size="icon"
												class="rounded-full bg-white/80 hover:bg-white"
												onclick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													// Your favorite logic here
													console.log('Favorited:', place.name);
												}}
											>
												<Heart class="size-6" />
											</Button>
										</div>
									</div>
								</Card.Root>
							</div>
						{/each}
					</div>
				</div>

				<!-- Places -->
				<h2 class="text-2xl font-semibold">The {$island.data.name} has plenty to offer</h2>

				<PlaceCarousel title="Great Food" places={$island.data.foodSpots} />
				<PlaceCarousel title="Leisurely Shopping" places={$island.data.retailSpots} />
				<PlaceCarousel title="Adventure" places={$island.data.adventures} />

				<CityCarousel
					heading="Popular Cities to visit in the {$island.data.name}"
					cities={$island.data.popularCities}
				/>
			</div>
		</div>
		<Footer />
	</div>
{/if}
