<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page as pageStore, navigating } from '$app/state';
	import { authModalActions } from '$lib/auth/auth-modal-store';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import FilterSidebar from './components/filter-sidebar.svelte';
	import Navbar from '../../lib/components/navbar.svelte';
	import { api } from '$lib/api';
	import { LoaderCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import PlaceCard from './components/place-card.svelte';
	import { PUBLIC_MAPBOX_API_KEY } from '$env/static/public';
	import PlaceDetailPanel from './components/place-detail-panel.svelte';
	import PlaceDetailSkeleton from './components/place-detail-skeleton.svelte';
	import { toast } from 'svelte-sonner';
	import type { GetPlaceResponse } from '$lib/types/place';
	import type { BAUser } from '$lib/types/user';
	import type { FilterState, PlaceType } from '$lib/types/types';

	interface Props {
		data: {
			searchParams: {
				[key: string]: string | string[] | undefined;
			};
			user: BAUser | null;
			initialPlaces: GetPlaceResponse[];
			pagination: any;
		};
	}

	let { data }: Props = $props();

	const queryClient = useQueryClient();

	// Places state
	let additionalPlaces = $state<GetPlaceResponse[]>([]);
	let isLoadingMore = $state(false);
	let isLoadingFilters = $state(false);
	let isPanelManuallyOpen = $state(false);
	let isPanelLoading = $state(false);
	let lastAppliedFilters = $state<string>('');

	// Reset additional places when data changes
	$effect(() => {
		const _trigger = data.initialPlaces;
		additionalPlaces = [];
		isLoadingFilters = false;
	});

	// Also reset loading when navigation completes
	$effect(() => {
		if (!navigating && isLoadingFilters) {
			// Small delay to ensure data has updated
			setTimeout(() => {
				isLoadingFilters = false;
			}, 100);
		}
	});

	// Combine places - use data.initialPlaces directly
	const allPlaces = $derived([...data.initialPlaces, ...additionalPlaces]);
	const totalCount = $derived(data.pagination.total);

	let pendingFavouritePlaceId = $state<string | null>(null);

	const favouritePlace = createMutation({
		mutationFn: api.place.favouritePlace,
		onMutate: (placeId) => {
			pendingFavouritePlaceId = placeId;
		},
		onSuccess: (result) => {
			toast.success(`Place ${result.action === 'added' ? 'added to' : 'removed from'} favourites`);
			invalidateAll();
		},
		onError: (error) => {
			toast.error(`Operation failed: ${error.message}`);
		},
		onSettled: () => {
			pendingFavouritePlaceId = null;
		}
	});

	// Selected place from URL
	const selectedPlaceSlug = $derived(pageStore.url.searchParams.get('place'));
	const selectedPlace = $derived(
		allPlaces.find((place) => place.slug === selectedPlaceSlug) || null
	);
	const isPanelOpen = $derived(isPanelManuallyOpen || selectedPlace !== null);

	// Stop loading when place is found
	$effect(() => {
		if (selectedPlace) {
			isPanelLoading = false;
		}
	});

	let sentinelElement: HTMLDivElement;

	const openAuthModal = () => {
		authModalActions.open('sign-in');
	};

	// Parse filters from URL - use data.searchParams
	function parseFiltersFromURL() {
		return {
			location: (data.searchParams.location as string) || null,
			types: data.searchParams.types
				? ((data.searchParams.types as string).split(',').filter(Boolean) as PlaceType[])
				: [],
			dogAccess: (data.searchParams.dogAccess as 'indoor' | 'outdoor' | 'both') || 'both',
			minRating: data.searchParams.minRating ? Number(data.searchParams.minRating) : 0,
			isNew: data.searchParams.isNew === 'true',
			isVerified: data.searchParams.isVerified === 'true'
		};
	}

	function handleApplyFilters(filterState: FilterState) {
		const params = new URLSearchParams();

		if (filterState.location) params.set('location', filterState.location.toLowerCase());
		if (filterState.types.length > 0) params.set('types', filterState.types.join(','));
		if (filterState.dogAccess !== 'both') params.set('dogAccess', filterState.dogAccess);
		if (filterState.minRating > 0) params.set('minRating', filterState.minRating.toString());
		if (filterState.isNew) params.set('isNew', 'true');
		if (filterState.isVerified) params.set('isVerified', 'true');

		const currentPlace = pageStore.url.searchParams.get('place');
		if (currentPlace) params.set('place', currentPlace);

		const newUrl = `/explore?${params.toString()}`;
		const currentUrl = pageStore.url.pathname + pageStore.url.search;

		// 🚫 Skip if URL already matches
		if (newUrl === currentUrl) {
			console.log('Same filters — skipping navigation');
			return;
		}

		if (isLoadingFilters) return;

		isLoadingFilters = true;
		goto(newUrl)
			.catch((err) => {
				console.error('Navigation error:', err);
			})
			.finally(() => {
				// delay reset until after navigation is done
				setTimeout(() => (isLoadingFilters = false), 300);
			});
	}

	async function loadMorePlaces() {
		if (isLoadingMore || !data.pagination.hasMore) return;

		isLoadingMore = true;
		const nextPage = data.pagination.page + 1;

		try {
			const filters = parseFiltersFromURL();
			const response = await api.place.getExplorePlaces({
				location: filters.location || undefined,
				types: filters.types.length > 0 ? filters.types : undefined,
				dogAccess: filters.dogAccess !== 'both' ? filters.dogAccess : undefined,
				minRating: filters.minRating > 0 ? filters.minRating : undefined,
				page: nextPage,
				limit: 20,
				sortBy: 'rating'
			});

			additionalPlaces = [...additionalPlaces, ...response.places];
		} catch (error) {
			console.error('Failed to load more places:', error);
			toast.error('Failed to load more places');
		} finally {
			isLoadingMore = false;
		}
	}

	// Use goto with options to prevent page reload but maintain reactivity
	function handleCardClick(place: GetPlaceResponse) {
		isPanelManuallyOpen = true;
		isPanelLoading = true;
		const params = new URLSearchParams(pageStore.url.searchParams);
		params.set('place', place.slug);
		goto(`/explore?${params.toString()}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	async function handleClosePanel() {
		isPanelManuallyOpen = false;
		isPanelLoading = false;
		await new Promise((r) => setTimeout(r, 250));
		const params = new URLSearchParams(pageStore.url.searchParams);
		params.delete('place');
		goto(`/explore?${params.toString()}`, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	}

	function handleFavouriteClick(placeId: string) {
		if (!data.user) {
			openAuthModal();
			return;
		}

		$favouritePlace.mutate(placeId);
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (first.isIntersecting && data.pagination.hasMore && !isLoadingMore) {
					loadMorePlaces();
				}
			},
			{ threshold: 0.1 }
		);

		if (sentinelElement) {
			observer.observe(sentinelElement);
		}

		return () => {
			if (sentinelElement) {
				observer.unobserve(sentinelElement);
			}
		};
	});
</script>

<svelte:head>
	<title>Explore - Woofs Welcome</title>
	<meta name="description" content="Explore dog froendly places newar you" /></svelte:head
>

<div class="bg-background min-h-screen">
	<Navbar user={data.user} />

	<div class="flex h-[calc(100vh-4rem)]">
		<div class="flex-shrink-0 overflow-y-auto overflow-x-hidden border-r bg-white lg:w-80">
			<FilterSidebar initialFilters={parseFiltersFromURL()} onApplyFilters={handleApplyFilters} />
		</div>

		<main
			class="bg-mint flex-1 overflow-y-auto p-6 pb-24 transition-[margin-right] duration-300 ease-in-out lg:pb-6"
			class:mr-[450px]={isPanelOpen}
		>
			<div class="mx-auto max-w-full">
				<div class="mb-6">
					<h1 class="text-2xl font-bold">Explore Dog-Friendly Places</h1>
					<p class="text-muted-foreground mt-1 text-sm">
						{totalCount} places found
					</p>
				</div>

				<!-- Loading overlay when filters are being applied -->
				{#if isLoadingFilters}
					<div class="mb-6 flex min-h-[80vh] items-center justify-center">
						<div class="flex items-center gap-3">
							<LoaderCircle class="text-primary size-10 animate-spin" />
						</div>
					</div>
				{/if}

				<div
					class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
					class:opacity-50={isLoadingFilters}
					class:pointer-events-none={isLoadingFilters}
					style="transition: opacity 200ms ease-in-out;"
				>
					{#each allPlaces as place (place.id)}
						<PlaceCard
							{place}
							onCardClick={() => handleCardClick(place)}
							onFavouriteClick={() => handleFavouriteClick(place.id)}
							favouritePending={pendingFavouritePlaceId === place.id}
						/>
					{/each}
				</div>

				<div bind:this={sentinelElement} class="flex h-20 items-center justify-center">
					{#if isLoadingMore}
						<LoaderCircle class="text-primary size-8 animate-spin" />
					{/if}
				</div>

				{#if allPlaces.length === 0 && !isLoadingFilters}
					<div class="py-12 text-center">
						<p class="text-muted-foreground">No places found. Try adjusting your filters.</p>
					</div>
				{/if}
			</div>
		</main>

		<!-- <div
			class="absolute inset-0 transition-opacity duration-300"
			class:opacity-100={isPanelOpen}
			class:opacity-0={!isPanelOpen}
			class:pointer-events-none={!isPanelOpen}
		></div> -->
	</div>

	<!-- Detail Panel -->
	<div
		class="fixed inset-y-0 right-0 z-50 w-full transform-gpu bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:w-[470px]"
		style:transform={isPanelOpen ? 'translateX(0)' : 'translateX(100%)'}
	>
		{#if isPanelLoading}
			<PlaceDetailSkeleton onClose={handleClosePanel} />
		{:else if selectedPlace}
			<PlaceDetailPanel
				place={selectedPlace}
				mapboxToken={PUBLIC_MAPBOX_API_KEY}
				onClose={handleClosePanel}
				user={data.user}
				{openAuthModal}
				searchParams={pageStore.url.searchParams}
			/>
		{/if}
	</div>
</div>
