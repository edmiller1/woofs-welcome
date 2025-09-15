<script lang="ts">
	import PlaceImageGrid from './../../../lib/components/place-image-grid.svelte';
	import { api } from '$lib/api/index.js';
	import { BadgeCheck, Loader2 } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import MainNavbar from '$lib/components/main-navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import { Button } from '$lib/components/ui/button';
	import { authModalActions } from '$lib/auth/auth-modal-store';
	import ImageDrawer from './components/image-drawer.svelte';
	import { PUBLIC_MAPBOX_API_KEY } from '$env/static/public';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import PlaceMap from './components/place-map.svelte';
	import { dummyReviews } from '$lib/data/dummy';
	import PlaceHours from './components/place-hours.svelte';
	import PlaceReviews from './components/place-reviews.svelte';
	import PlaceDetails from './components/place-details.svelte';
	import PlaceDescription from './components/place-description.svelte';
	import ShareButton from '$lib/components/share-button.svelte';
	import { page } from '$app/state';
	import SaveButton from '$lib/components/save-button.svelte';
	import type { Tab } from '$lib/types/models';
	import { classNames } from '$lib/helpers';
	import StickyHeader from './components/sticky-header.svelte';

	const tabs: Tab[] = [
		{ name: 'About', href: '#about' },
		{ name: 'Dog Policy', href: '#dog-policy' },
		{ name: 'Reviews', href: '#reviews' }
	];

	let { data } = $props();
	const user = $derived(data.user);

	const place = createQuery({
		queryKey: ['place', data.slug],
		queryFn: () => api.place.getPlace(data.slug)
	});

	let imagesOpen = $state<boolean>(false);
	let currentTab = $state<string>('About');
	let mapComponent = $state<any>();
	let scrollY = $state(0);
	let headerElement = $state<HTMLElement>();
	let showStickyHeader = $state(false);

	const coordinates = $derived(() => {
		if ($place.isSuccess && $place.data.latitude && $place.data.longitude) {
			return {
				lat: parseFloat($place.data.latitude),
				lng: parseFloat($place.data.longitude)
			};
		}
		return null;
	});

	const changeTab = (tab: string) => {
		currentTab = tab;
	};

	const openImageDrawer = () => {
		imagesOpen = true;
	};

	const openAuthModal = () => {
		authModalActions.open('sign-in');
	};

	const handleMapReady = (map: mapboxgl.Map) => {
		console.log('Map is ready!', map);
		// You can add any map initialization logic here
	};

	$effect(() => {
		if (headerElement && scrollY > 0) {
			const headerBottom = headerElement.offsetTop + headerElement.offsetHeight;
			showStickyHeader = scrollY > headerBottom;
		}
	});
</script>

<svelte:window bind:scrollY />

{#if $place.isError}
	<div>Error</div>
{/if}

{#if $place.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="text-primary size-10 animate-spin" />
	</div>
{/if}

{#if $place.isSuccess}
	<!-- Sticky Header -->
	<StickyHeader
		placeName={$place.data.name}
		placeClaim={$place.data.claim}
		placeId={$place.data.id}
		{user}
		{openAuthModal}
		{changeTab}
		{tabs}
		{currentTab}
		isFavourited={$place.data.isFavourited}
		{headerElement}
		{scrollY}
		{showStickyHeader}
	/>

	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
		<MainNavbar {user} currentPlace={$place.data.name} />

		<div class="py-2 lg:flex lg:items-center lg:justify-between">
			<div class="min-w-0 flex-1">
				<Breadcrumbs
					type="place"
					islandName={$place.data.city.region.island.name}
					regionName={$place.data.city.region.name}
					cityName={$place.data.city.name}
					placeName={$place.data.name}
				/>
				<div bind:this={headerElement} class="my-4 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<h2 class="text-2xl/7 font-bold sm:truncate sm:text-4xl sm:tracking-tight">
							{$place.data.name}
						</h2>
						{#if $place.data.claim}
							<BadgeCheck
								class="hidden size-8 text-white sm:inline-block"
								fill="oklch(0.63 0.17 149)"
							/>
						{/if}
					</div>
					<div class="flex items-center gap-4">
						<ShareButton link={page.url.href} name={$place.data.name} />
						{#if !$place.data.claim}
							<Button
								class="rounded-full"
								onclick={user
									? () => {
											console.log('Claiming place');
										}
									: openAuthModal}>Claim <BadgeCheck class="size-4" /></Button
							>
						{/if}

						<SaveButton
							{user}
							{openAuthModal}
							placeId={$place.data.id}
							isFavourited={$place.data.isFavourited}
						/>
					</div>
				</div>

				<PlaceImageGrid images={$place.data.images} {openImageDrawer} />
				<ImageDrawer
					{imagesOpen}
					images={$place.data.images.map((img) => ({
						url: img.url,
						altText: img.altText || 'Place image'
					}))}
				/>
				<div class="flex">
					<div class="mr-3 w-2/3">
						<div class="hidden sm:block">
							<div class="border-b border-gray-200 dark:border-white/10">
								<nav aria-label="Tabs" class="-mb-px flex space-x-8 font-semibold">
									{#each tabs as tab}
										<a
											href={tab.href}
											aria-current={currentTab ? 'page' : undefined}
											class={classNames(
												currentTab === tab.name
													? 'border-primary text-[#304cc5] dark:border-[#4e7ce3] dark:text-[#4e7ce3]'
													: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-200',
												'whitespace-nowrap border-b-2 px-1 py-4 text-sm'
											)}
											onclick={() => changeTab(tab.name)}>{tab.name}</a
										>
									{/each}
								</nav>
							</div>
						</div>
						<div id="about" class="py-4">
							<!-- Main details -->
							<PlaceDetails
								address={$place.data.address}
								website={$place.data.website}
								email={$place.data.email}
								phone={$place.data.phone}
							/>
							<!-- Description -->
							<PlaceDescription
								description={$place.data.description}
								claim={$place.data.claim}
								{user}
								{openAuthModal}
							/>
						</div>
						<!-- Dog Policy -->
						<div id="dog-policy" class="py-4">
							<h3 class="text-2xl font-semibold">Dog Policy</h3>
							{#if $place.data.dogPolicy}
								<div
									class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20"
								>
									<p class="text-primary dark:text-blue-100">{$place.data.dogPolicy}</p>
								</div>

								<div class="mt-4 flex gap-4">
									{#if $place.data.indoorAllowed}
										<div class="flex items-center gap-2 text-green-700 dark:text-green-400">
											<div class="h-2 w-2 rounded-full bg-green-500"></div>
											<span class="text-sm">Indoor allowed</span>
										</div>
									{/if}

									{#if $place.data.outdoorAllowed}
										<div class="flex items-center gap-2 text-green-700 dark:text-green-400">
											<div class="h-2 w-2 rounded-full bg-green-500"></div>
											<span class="text-sm">Outdoor allowed</span>
										</div>
									{/if}
								</div>
							{:else}
								<p class="mt-2 italic text-gray-500 dark:text-gray-400">
									Dog policy information not available.
								</p>
							{/if}
						</div>
					</div>
					<div class="flex w-1/3 flex-col gap-5">
						<!-- Hours -->
						<PlaceHours hours={$place.data.hours} />
						<!-- Map -->
						{#if coordinates() !== null}
							{@const coords = coordinates()}
							<div class="rounded-xl border p-4 shadow">
								<div class="flex items-center justify-between">
									<h4 class="text-lg font-semibold">Location</h4>
									<Button variant="link" class="rounded-full px-0">View larger map</Button>
								</div>
								<PlaceMap
									bind:this={mapComponent}
									accessToken={PUBLIC_MAPBOX_API_KEY}
									lng={coords!.lng}
									lat={coords!.lat}
									zoom={15}
									markerLabel={$place.data.name}
									className="h-96"
									onMapReady={handleMapReady}
								/>
							</div>
						{:else}
							<div class="mt-4 text-red-600">Location not available</div>
						{/if}
					</div>
				</div>
				<!-- Reviews -->
				<PlaceReviews
					reviews={dummyReviews}
					{openAuthModal}
					{user}
					placeId={$place.data.id}
					placeName={$place.data.name}
					placeTypes={$place.data.types}
				/>
			</div>
		</div>
		<Footer />
	</div>
{/if}
