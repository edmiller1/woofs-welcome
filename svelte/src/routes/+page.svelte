<script lang="ts">
	import { browser } from '$app/environment';
	import { api } from '$lib/api/index.js';
	import { auth } from '$lib/auth/stores.js';
	import Navbar from '$lib/components/navbar.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import {
		Search,
		ChevronDown,
		ArrowRight,
		MapPin,
		SlidersHorizontal,
		Share,
		Camera,
		Star,
		Heart
	} from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import hero from '$lib/assets/dogs-2.png';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { fade } from 'svelte/transition';
	import Footer from '$lib/components/footer.svelte';
	import ErrorBoundary from '$lib/components/error-boundary.svelte';
	import PlaceCardSkeleton from '$lib/components/place-card-skeleton.svelte';

	let { data } = $props();
	const user = $derived(data.user);

	let selectedCity = $state<string>('');
	let selectedType = $state<string>('');

	// onMount(() => {
	// 	if (!user) {
	// 		auth.displayOneTap();
	// 	}
	// });

	const cities = createQuery({
		queryKey: ['cities'],
		queryFn: api.city.getCities,
		enabled: browser
	});

	const types = createQuery({
		queryKey: ['types'],
		queryFn: api.place.getTypes,
		enabled: browser
	});

	const places = createQuery({
		queryKey: ['places'],
		queryFn: api.place.getRandomPlaces
	});

	const selectCity = (city: string) => {
		selectedCity = city;
	};

	const selectType = (type: string) => {
		selectedType = type;
	};
</script>

<div class="min-h-screen bg-[#fefaf5]">
	<Navbar {user} />
	<!-- <PlaceFilters /> -->
	<div class="-lg:px-8 -md:px-5 mx-auto w-full px-12">
		<div class="max-w-screen-3xl mx-auto">
			<div
				class="xs:-mt-20 grid items-center gap-x-20 gap-y-7 py-12 xl:min-h-screen xl:grid-cols-[760px_auto] xl:py-20"
			>
				<div class="flex flex-col">
					<h1 class="mb-6 text-2xl font-bold text-[#2a2a2a] md:text-6xl">
						Discover and explore New Zealand's dog-friendly places
					</h1>
					<h2 class="mb-8 text-xl text-[#2a2a2a]">
						Find your next adventure with your furry companions.
					</h2>
					<div
						class="mt-8 flex h-16 w-full flex-col rounded-full bg-white shadow-lg shadow-black/10 md:max-w-[540px] md:flex-row xl:mt-10"
					>
						<div class="flex w-full items-center">
							<div class="pl-4 pr-2">
								<Search class="text-muted-foreground h-5 w-5" />
							</div>

							<div class="w-full">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger class="w-full px-1">
										<button
											class="text-foreground hover:bg-muted focus:ring-ring mt-2 h-full w-full cursor-pointer rounded-full px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 xl:mt-0"
										>
											<div class="flex w-full items-center justify-between">
												<span class="text-base font-medium"
													>{selectedCity ? selectCity : 'All Cities'}</span
												>
												<ChevronDown class="text-muted-foreground h-4 w-4 flex-shrink-0" />
											</div>
										</button>
									</DropdownMenu.Trigger>
									{#if $cities.isSuccess}
										<DropdownMenu.Content
											class="-ml-10 mt-3 max-h-64 w-[510px] overflow-y-auto"
											align="start"
											side="bottom"
										>
											{#each $cities.data as city}
												<DropdownMenu.Item
													class="cursor-pointer {selectedCity === city.id
														? 'bg-accent text-accent-foreground'
														: ''}"
													onclick={() => selectCity(city.id)}
												>
													{city.name}
												</DropdownMenu.Item>
											{/each}
										</DropdownMenu.Content>
									{/if}
								</DropdownMenu.Root>
							</div>
							<div class="bg-border mx-2 h-8 w-px"></div>
							<div class="w-full">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger class="w-full px-1">
										<button
											class="text-foreground hover:bg-muted focus:ring-ring mt-2 w-full cursor-pointer rounded-full px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 xl:mt-0"
										>
											<div class="flex items-center justify-between">
												<span class="text-base font-medium"
													>{selectedType ? selectedType : 'All Types'}</span
												>
												<ChevronDown class="text-muted-foreground h-4 w-4" />
											</div>
										</button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content
										class="absolute top-1 -ml-72 mt-3 max-h-64 w-[520px] overflow-y-auto"
										align="start"
										side="bottom"
									>
										{#if $types.isSuccess}
											{#each $types.data as type}
												<DropdownMenu.Item
													class="cursor-pointer {selectedType === type
														? 'bg-accent text-accent-foreground'
														: ''}"
													onclick={() => selectType(type)}
												>
													{type}
												</DropdownMenu.Item>
											{/each}
										{/if}
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
					</div>
					<div class="mt-7 xl:mt-8">
						<a href="/explore">
							<button
								class="inline-flex cursor-pointer items-center rounded-full border border-zinc-900 px-20 py-5 hover:bg-[#fbecd9]"
								>Start Exploring <ArrowRight class="siz-5 ml-2" />
							</button>
						</a>
					</div>
				</div>
				<div class="rounded-4xl order-first m-auto w-full overflow-hidden xl:order-last">
					<img class="h-auto w-[800px] rounded-xl" src={hero} alt="--" />
				</div>
			</div>
		</div>
	</div>

	<!-- Carousel -->
	<div class="overflow-hidden">
		<div class="mx-auto w-full px-12">
			<div class="max-w-screen-3xl mx-auto">
				<div class="py-12 lg:py-28">
					<div class="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
						<div transition:fade>
							<p class="text-3xl md:text-[44px] md:leading-[60px]">
								Over 1400 dog-friendly places to explore
							</p>
						</div>
						<a
							href="/explore"
							class="flex items-center rounded-full border border-zinc-800 px-10 py-2.5 hover:bg-[#fbecd9]"
							>Explore<ArrowRight class="ml-2 size-4" /></a
						>
					</div>
					<ErrorBoundary error={$places.error}>
						{#if $places.isPending}
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
								{#each Array(8) as _}
									<PlaceCardSkeleton />
								{/each}
							</div>
						{:else if $places.isSuccess}
							<div class="mx-auto w-full">
								<div class="relative mx-auto w-full">
									<div class="relative w-full">
										<Carousel.Root
											opts={{
												align: 'start'
											}}
											class="w-full"
										>
											<Carousel.Content class="-ml-2 md:-ml-4">
												{#each $places.data.places as place}
													<Carousel.Item
														class="-lg:pl-8 -md:pl-3 relative w-full basis-[500px] pl-10"
													>
														<a
															href="/place/{place.slug}"
															aria-label="Explore {place.name}"
															class="no-underline"
														>
															<div class="relative z-[99] h-2/3 w-full overflow-hidden rounded-2xl">
																<img
																	src={place.images[0].webp.src}
																	srcset={place.images[0].webp.srcset}
																	alt={place.name}
																	class="h-full w-full object-cover"
																/>
																<div class="absolute inset-0 z-50 flex flex-col justify-between">
																	<div class="p-5">
																		<div class="inline-block py-5 text-3xl font-[500] text-white">
																			{place.name}
																		</div>
																	</div>
																	<div class="p-4">
																		<div
																			class="inline-block py-5 text-xl font-[500] leading-3 text-white"
																		>
																			{place.city.name}, {place.city.region.name}
																		</div>
																	</div>
																</div>
																<div
																	class="absolute inset-0 h-full w-full bg-black opacity-40"
																></div>
															</div>
														</a>
													</Carousel.Item>
												{/each}
											</Carousel.Content>
											<div class="absolute bottom-48 left-4 z-10 ml-16 flex">
												<Carousel.Previous
													class="rounded-full border-zinc-900 bg-[#fefaf5] text-zinc-900 hover:bg-[#fbecd9] hover:text-zinc-900"
												/>
												<Carousel.Next
													class="rounded-full border-zinc-900 bg-[#fefaf5] text-zinc-900 hover:bg-[#fbecd9] hover:text-zinc-900"
												/>
											</div>
										</Carousel.Root>
									</div>
								</div>
							</div>
						{/if}
					</ErrorBoundary>
				</div>
			</div>
		</div>
	</div>

	<!-- App features -->
	<div class="bg-[#fefaf5] py-16 lg:py-24">
		<div class="mx-auto w-full px-12">
			<div class="max-w-screen-3xl mx-auto">
				<!-- Section Header -->
				<div class="mb-16 text-center" transition:fade>
					<h2 class="text-3xl md:text-[44px] md:leading-[60px]">Take your adventures on the go</h2>
					<p class="mx-auto max-w-2xl text-xl text-zinc-500 md:leading-[30px]">
						Download the Woofs Welcome mobile app for free
					</p>
				</div>

				<!-- Feature Block 1 -->
				<div class="mb-24 grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
					<!-- iPhone mockup -->
					<div class="order-2 flex justify-center lg:order-1">
						<div class="relative">
							<!-- iPhone frame -->
							<div class="relative rounded-[3rem] bg-black p-2 shadow-2xl">
								<div class="h-[600px] w-[280px] overflow-hidden rounded-[2.5rem] bg-white">
									<!-- Status bar -->
									<div class="flex h-8 items-center justify-between bg-white px-6 pt-2">
										<div class="flex items-center space-x-1">
											<div class="text-xs font-semibold">9:41</div>
										</div>
										<div class="flex items-center space-x-1">
											<div class="h-2 w-4 rounded-sm bg-black"></div>
											<div class="h-2 w-1 rounded-sm bg-black"></div>
											<div class="h-3 w-6 rounded-sm border border-black">
												<div class="h-full w-4 rounded-sm bg-black"></div>
											</div>
										</div>
									</div>
									<!-- App screenshot placeholder -->
									<div class="flex h-full flex-col bg-gradient-to-b from-[#fbecd9] to-[#f5e6d3]">
										<!-- App header -->
										<div class="bg-white p-4 shadow-sm">
											<div class="flex items-center justify-between">
												<div class="h-8 w-8 rounded-full bg-[#fbecd9]"></div>
												<div class="text-lg font-semibold text-[#2a2a2a]">Explore</div>
												<div class="h-8 w-8 rounded-full bg-[#fbecd9]"></div>
											</div>
										</div>
										<!-- Map placeholder -->
										<div class="relative flex-1 bg-green-100">
											<div class="absolute inset-4 rounded-lg bg-green-200"></div>
											<!-- Location pins -->
											<div
												class="absolute left-8 top-8 h-6 w-6 rounded-full border-2 border-white bg-red-500"
											></div>
											<div
												class="absolute right-12 top-16 h-6 w-6 rounded-full border-2 border-white bg-blue-500"
											></div>
											<div
												class="absolute bottom-20 left-12 h-6 w-6 rounded-full border-2 border-white bg-yellow-500"
											></div>
										</div>
										<!-- Bottom card -->
										<div class="h-32 rounded-t-3xl bg-white p-4">
											<div class="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
											<div class="mb-2 h-3 w-1/2 rounded bg-gray-100"></div>
											<div class="h-3 w-2/3 rounded bg-gray-100"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Features list -->
					<div class="order-1 lg:order-2">
						<h3 class="mb-8 text-2xl md:text-[36px] md:leading-[60px]">
							Find dog-friendly places anywhere
						</h3>
						<div class="space-y-6">
							<div class="flex items-start space-x-4">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
								>
									<MapPin class="size-6" />
								</div>
								<div>
									<h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">Discover Nearby Places</h4>
									<p class="text-gray-600">
										Use GPS to find dog-friendly spots within walking distance or plan your next
										road trip adventure.
									</p>
								</div>
							</div>

							<div class="flex items-start space-x-4">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
								>
									<SlidersHorizontal class="size-6" />
								</div>
								<div>
									<h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">Smart Filters</h4>
									<p class="text-gray-600">
										Filter by location, place type, indoor/outdoor access, and more to find exactly
										what you need.
									</p>
								</div>
							</div>

							<div class="flex items-start space-x-4">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
								>
									<Share class="size-6" />
								</div>
								<div>
									<h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">Share</h4>
									<p class="text-gray-600">Share your favorite spots with friends and family.</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Feature Block 2 -->
				<div class="mb-24 grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
					<!-- Features list -->
					<div class="order-1">
						<h3 class="mb-8 text-2xl font-bold text-[#2a2a2a] md:text-4xl">
							Save and review your experiences
						</h3>
						<div class="space-y-6">
							<div class="flex items-start space-x-4">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
								>
									<Heart class="size-6" />
								</div>
								<div>
									<h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">Save Favorites</h4>
									<p class="text-gray-600">
										Create your personal list of must-visit places and access them offline when you
										need them most.
									</p>
								</div>
							</div>

							<div class="flex items-start space-x-4">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
								>
									<Star class="size-6" />
								</div>
								<div>
									<h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">Rate & Review</h4>
									<p class="text-gray-600">
										Help other dog owners by sharing your experiences and reading authentic reviews
										from the community.
									</p>
								</div>
							</div>

							<div class="flex items-start space-x-4">
								<div
									class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
								>
									<Camera class="size-6" />
								</div>
								<div>
									<h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">Add Photos</h4>
									<p class="text-gray-600">
										Capture and share moments with your furry friend to help others visualize their
										next adventure.
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- iPhone mockup -->
					<div class="order-2 flex justify-center">
						<div class="relative">
							<!-- iPhone frame -->
							<div class="relative rounded-[3rem] bg-black p-2 shadow-2xl">
								<div class="h-[600px] w-[280px] overflow-hidden rounded-[2.5rem] bg-white">
									<!-- Status bar -->
									<div class="flex h-8 items-center justify-between bg-white px-6 pt-2">
										<div class="flex items-center space-x-1">
											<div class="text-xs font-semibold">9:41</div>
										</div>
										<div class="flex items-center space-x-1">
											<div class="h-2 w-4 rounded-sm bg-black"></div>
											<div class="h-2 w-1 rounded-sm bg-black"></div>
											<div class="h-3 w-6 rounded-sm border border-black">
												<div class="h-full w-4 rounded-sm bg-black"></div>
											</div>
										</div>
									</div>
									<!-- App screenshot placeholder -->
									<div class="flex h-full flex-col bg-gradient-to-b from-[#fbecd9] to-[#f5e6d3]">
										<!-- App header -->
										<div class="bg-white p-4 shadow-sm">
											<div class="flex items-center justify-between">
												<div class="h-8 w-8 rounded-full bg-[#fbecd9]"></div>
												<div class="text-lg font-semibold text-[#2a2a2a]">Favorites</div>
												<div
													class="flex h-8 w-8 items-center justify-center rounded-full bg-[#fbecd9]"
												>
													<svg
														class="h-4 w-4 text-[#2a2a2a]"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fill-rule="evenodd"
															d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
															clip-rule="evenodd"
														></path>
													</svg>
												</div>
											</div>
										</div>
										<!-- Favorites list -->
										<div class="flex-1 space-y-3 p-4">
											<!-- Favorite item 1 -->
											<div class="rounded-xl bg-white p-3 shadow-sm">
												<div class="flex items-center space-x-3">
													<div class="h-12 w-12 rounded-lg bg-green-200"></div>
													<div class="flex-1">
														<div class="mb-1 h-3 w-3/4 rounded bg-gray-200"></div>
														<div class="h-2 w-1/2 rounded bg-gray-100"></div>
													</div>
													<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
														<path
															fill-rule="evenodd"
															d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
															clip-rule="evenodd"
														></path>
													</svg>
												</div>
											</div>
											<!-- Favorite item 2 -->
											<div class="rounded-xl bg-white p-3 shadow-sm">
												<div class="flex items-center space-x-3">
													<div class="h-12 w-12 rounded-lg bg-blue-200"></div>
													<div class="flex-1">
														<div class="mb-1 h-3 w-2/3 rounded bg-gray-200"></div>
														<div class="h-2 w-3/4 rounded bg-gray-100"></div>
													</div>
													<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
														<path
															fill-rule="evenodd"
															d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
															clip-rule="evenodd"
														></path>
													</svg>
												</div>
											</div>
											<!-- Favorite item 3 -->
											<div class="rounded-xl bg-white p-3 shadow-sm">
												<div class="flex items-center space-x-3">
													<div class="h-12 w-12 rounded-lg bg-yellow-200"></div>
													<div class="flex-1">
														<div class="mb-1 h-3 w-4/5 rounded bg-gray-200"></div>
														<div class="h-2 w-1/3 rounded bg-gray-100"></div>
													</div>
													<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
														<path
															fill-rule="evenodd"
															d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
															clip-rule="evenodd"
														></path>
													</svg>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Download CTA -->
				<div class="text-center">
					<h3 class="mb-6 text-2xl font-bold text-[#2a2a2a] md:text-3xl">
						Ready to start exploring?
					</h3>
					<p class="mx-auto mb-8 max-w-xl text-lg text-gray-600">
						Join thousands of dog owners who trust our app to find the perfect spots for their furry
						friends.
					</p>
					<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<!-- App Store Button -->
						<a
							href="/"
							class="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
						>
							<svg class="mr-3 h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
								/>
							</svg>
							<div class="text-left">
								<div class="text-xs">Download on the</div>
								<div class="text-lg font-semibold">App Store</div>
							</div>
						</a>
						<!-- Google Play Button -->
						<a
							href="/"
							class="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
						>
							<svg class="mr-3 h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
								/>
							</svg>
							<div class="text-left">
								<div class="text-xs">Get it on</div>
								<div class="text-lg font-semibold">Google Play</div>
							</div>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
	<Footer />
</div>
