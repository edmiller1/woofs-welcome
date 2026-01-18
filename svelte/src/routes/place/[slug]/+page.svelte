<script lang="ts">
	import PlaceImageGrid from './../../../lib/components/place-image-grid.svelte';
	import { api } from '$lib/api/index.js';
	import { BadgeCheck } from '@lucide/svelte';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import Footer from '$lib/components/footer.svelte';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import { Button } from '$lib/components/ui/button';
	import { authModalActions } from '$lib/auth/auth-modal-store';
	import ImageDrawer from './components/image-drawer.svelte';
	import { PUBLIC_MAPBOX_API_KEY } from '$env/static/public';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import PlaceMap from './components/place-map.svelte';
	import PlaceHours from './components/place-hours.svelte';
	import PlaceReviews from './components/place-reviews.svelte';
	import PlaceDetails from './components/place-details.svelte';
	import PlaceDescription from './components/place-description.svelte';
	import ShareButton from '$lib/components/share-button.svelte';
	import { page } from '$app/state';
	import SaveButton from '$lib/components/save-button.svelte';
	import { classNames } from '$lib/helpers';
	import StickyHeader from './components/sticky-header.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import PlaceMapDialog from './components/place-map-dialog.svelte';
	import ErrorBoundary from '$lib/components/error-boundary.svelte';
	import LoadingSpinner from '$lib/components/loading-spinner.svelte';
	import SeoHead from '$lib/components/seo-head.svelte';
	import {
		getPlaceSchema,
		getBreadcrumbSchema,
		getOrganizationSchema
	} from '$lib/seo/structured-data';
	import { getAbsoluteUrl, generateKeywords } from '$lib/seo/metadata';
	import Navbar from '$lib/components/navbar.svelte';
	import type { Tab } from '$lib/types/types';
	import type { BAUser } from '$lib/types/user';
	import { goto } from '$app/navigation';

	interface Props {
		data: {
			searchParams: {
				[key: string]: string | string[] | undefined;
			};
			user: BAUser | null;
			slug: string;
		};
	}

	const tabs: Tab[] = [
		{ name: 'About', href: '#about' },
		{ name: 'Dog Policy', href: '#dog-policy' },
		{ name: 'Reviews', href: '#reviews' }
	];

	let { data }: Props = $props();

	const { searchParams, user, slug } = data;

	const queryClient = useQueryClient();

	let imagesOpen = $state<boolean>(false);
	let currentTab = $state<string>('About');
	let mapComponent = $state<any>();
	let scrollY = $state(0);
	let headerElement = $state<HTMLElement>();
	let showStickyHeader = $state(false);
	let mapOpen = $state<boolean>(false);
	let currentPage = $state<number>(1);

	const place = createQuery({
		queryKey: ['place', slug],
		queryFn: () => api.place.getPlace(slug)
	});

	const breeds = createQuery({
		queryKey: ['breeds'],
		queryFn: () => api.review.getBreeds()
	});

	const coordinates = $derived(() => {
		if ($place.isSuccess && $place.data.latitude && $place.data.longitude) {
			return {
				lat: parseFloat($place.data.latitude),
				lng: parseFloat($place.data.longitude)
			};
		}
		return null;
	});

	onMount(() => {
		const handleMessage = (event: any) => {
			if (event.origin !== window.location.origin) return;

			if (event.data.type === 'REVIEW_CREATED') {
				// Invalidate relevant queries
				queryClient.invalidateQueries({
					queryKey: ['place', event.data.placeSlug]
				});
				queryClient.invalidateQueries({
					queryKey: ['reviews', event.data.placeId]
				});

				toast.success('Review added successfully!');
			}
		};

		window.addEventListener('message', handleMessage);

		const sections = document.querySelectorAll('section[data-tab], div[data-tab]');

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const tabName = entry.target.getAttribute('data-tab');
						if (tabName) {
							currentTab = tabName;
						}
					}
				});
			},
			{
				rootMargin: '-100px 0px -10% 0px', // Adjust based on your sticky header height
				threshold: 0.1
			}
		);

		sections.forEach((section) => observer.observe(section));

		return () => {
			window.removeEventListener('message', handleMessage);
			sections.forEach((section) => observer.unobserve(section));
		};
	});

	const changePage = (newPage: number) => {
		currentPage = newPage;
	};

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

	const handleMapOpen = () => {
		mapOpen = true;
	};

	$effect(() => {
		if (headerElement && scrollY > 0) {
			const headerBottom = headerElement.offsetTop + headerElement.offsetHeight;
			showStickyHeader = scrollY > headerBottom;
		}
	});

	// Generate SEO metadata
	const metadata = $derived.by(() => {
		if (!$place.data) {
			return {
				title: 'Loading...',
				description: 'Loading place information...'
			};
		}

		const p = $place.data;
		const cityName = p.city?.name || '';
		const regionName = p.city?.region?.name || '';

		// Generate descriptive title
		const title = `${p.name} - Dog Friendly ${p.types?.[0] || 'Place'} in ${cityName}`;

		// Generate rich description
		let description =
			p.description ||
			`Find out why ${p.name} is a dog-friendly ${p.types?.[0]?.toLowerCase() || 'place'} in ${cityName}, ${regionName}.`;

		// Add rating info
		if (p.rating && p.reviewsCount) {
			description += ` Rated ${p.rating}/5 from ${p.reviewsCount} dog owner reviews.`;
		}

		// Add amenity info
		const amenities = [];
		if (p.indoorAllowed) amenities.push('dogs allowed indoors');
		if (p.outdoorAllowed) amenities.push('outdoor seating available');
		if (amenities.length > 0) {
			description += ` ${amenities.join(', ')}.`;
		}

		// Generate keywords
		const keywords = generateKeywords(`${p.name} ${cityName} ${regionName} ${p.types?.join(' ')}`, [
			`dog friendly ${cityName}`,
			`dog friendly ${regionName}`,
			`${p.types?.[0]?.toLowerCase()} ${cityName}`,
			'dogs allowed',
			'pet friendly',
			p.name
		]);

		return {
			title,
			description,
			keywords,
			image: p.images?.[0]?.url,
			url: getAbsoluteUrl(window.location.pathname),
			type: 'place' as const
		};
	});

	// Generate structured data
	const structuredData = $derived.by(() => {
		if (!$place.data) return [];

		const schemas = [];

		// Organization schema (on all pages)
		schemas.push(getOrganizationSchema());

		// Place schema
		schemas.push(getPlaceSchema($place.data));

		// Breadcrumb schema
		const breadcrumbs = [
			{ name: 'Home', url: getAbsoluteUrl('/') },
			{
				name: $place.data.city?.region?.island?.name || 'New Zealand',
				url: getAbsoluteUrl(`/island/${$place.data.city?.region?.island?.slug}`)
			},
			{
				name: $place.data.city?.region?.name || 'Region',
				url: getAbsoluteUrl(`/region/${$place.data.city?.region?.slug}`)
			},
			{
				name: $place.data.city?.name || 'City',
				url: getAbsoluteUrl(`/city/${$place.data.city?.slug}`)
			},
			{ name: $place.data.name, url: getAbsoluteUrl(window.location.pathname) }
		];
		schemas.push(getBreadcrumbSchema(breadcrumbs));

		return schemas;
	});
</script>

<!-- SEO Head -->
{#if $place.data}
	<SeoHead {metadata} {structuredData} />
{/if}

<svelte:window bind:scrollY />

<ErrorBoundary error={$place.error}>
	{#if $place.isLoading}
		<div class="flex min-h-screen items-center justify-center">
			<LoadingSpinner size="lg" />
		</div>
	{/if}

	{#if $place.isSuccess}
		<!-- Sticky Header -->
		<StickyHeader
			placeName={$place.data.name}
			placeClaim={$place.data.activeClaim}
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
			<Navbar {user} currentPlace={$place.data.name} />

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
							{#if $place.data.activeClaim}
								<BadgeCheck
									class="hidden size-8 text-white sm:inline-block"
									fill="oklch(0.63 0.17 149)"
								/>
							{/if}
						</div>
						<div class="flex items-center gap-4">
							<ShareButton link={page.url.href} name={$place.data.name} />
							{#if !$place.data.activeClaim}
								{#if user && user.isBusinessAccount}
									<a href={`/claim/${$place.data.slug}`}>
										<Button>Claim <BadgeCheck class="size-4" /></Button>
									</a>
								{:else if user && !user.isBusinessAccount}
									<a href="/sign-in?business=true">
										<Button>Claim <BadgeCheck class="size-4" /></Button>
									</a>
								{:else}
									<a href="/sign-in">
										<Button>Claim <BadgeCheck class="size-4" /></Button>
									</a>
								{/if}
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
														? 'border-primary text-primary'
														: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
													'whitespace-nowrap border-b-2 px-1 py-4 text-sm'
												)}>{tab.name}</a
											>
										{/each}
									</nav>
								</div>
							</div>
							<div id="about" data-tab="About" class="py-4">
								<!-- Main details -->
								<PlaceDetails
									address={$place.data.address}
									website={$place.data.website ?? ''}
									email={$place.data.email}
									phone={$place.data.phone ?? ''}
								/>
								<!-- Description -->
								<PlaceDescription
									description={$place.data.description}
									claim={$place.data.activeClaim}
									{user}
									{openAuthModal}
								/>
							</div>
							<!-- Dog Policy -->
							<div id="dog-policy" data-tab="Dog Policy" class="py-4">
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
										<Button variant="link" class="rounded-full px-0" onclick={handleMapOpen}
											>View larger map</Button
										>
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
					<div id="reviews" data-tab="Reviews" class="py-4">
						<!-- Reviews -->
						<PlaceReviews
							{openAuthModal}
							{user}
							placeName={$place.data.name}
							placeSlug={$place.data.slug}
							{currentPage}
							onPageChange={changePage}
							dogBreeds={$breeds.data?.breeds}
						/>
					</div>
				</div>
			</div>
			<Footer />
			{#if coordinates() !== null}
				{@const coords = coordinates()}
				<PlaceMapDialog
					bind:open={mapOpen}
					placeName={$place.data.name}
					lng={coords!.lng}
					lat={coords!.lat}
					accessToken={PUBLIC_MAPBOX_API_KEY}
					onMapReady={handleMapReady}
					place={$place.data}
				/>
			{/if}
		</div>
	{/if}
</ErrorBoundary>
