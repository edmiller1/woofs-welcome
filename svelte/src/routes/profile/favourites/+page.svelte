<script lang="ts">
	import { api } from '$lib/api';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { BAUser } from '$lib/types/models';
	import { LoaderCircle } from '@lucide/svelte';
	import PlaceCard from './components/place-card.svelte';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	const { data }: Props = $props();

	const { user } = data;

	const queryClient = useQueryClient();

	// State

	const limit = 12;
	let currentPage = $state<number>(1);
	let pendingUnfavouritePlaceId = $state<string | null>(null);

	const offset = $derived((currentPage - 1) * limit);

	const favourites = createQuery({
		queryKey: ['profile-favourites', offset],
		queryFn: () => api.auth.getProfileFavourites(limit, offset)
	});

	const favouritePlace = createMutation({
		mutationFn: api.place.favouritePlace,
		onMutate: (placeId) => {
			pendingUnfavouritePlaceId = placeId;
		},
		onSuccess: (result) => {
			toast.success(`Place ${result.action === 'added' ? 'added to' : 'removed from'} favourites`);
			currentPage = 1;
			queryClient.invalidateQueries({
				queryKey: ['profile-favourites']
			});
		},
		onError: (error) => {
			toast.error(`Operation failed: ${error.message}`);
		},
		onSettled: () => {
			pendingUnfavouritePlaceId = null;
		}
	});

	const handleUnfavouriteClick = (placeId: string) => {
		$favouritePlace.mutate(placeId);
	};

	// Handle page change
	const handlePageChange = (newPage: number) => {
		currentPage = newPage;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Calculate total pages
	const totalPages = $derived($favourites.data ? Math.ceil($favourites.data.total / limit) : 0);
</script>

<div class="max-w-full">
	<div class="mb-6">
		<h1 class="mb-2 text-2xl font-bold">Favourites</h1>
		{#if $favourites.isSuccess}
			<p class="text-sm text-gray-600">
				Showing {Math.min(offset + 1, $favourites.data.total)}-{Math.min(
					offset + limit,
					$favourites.data.total
				)} of {$favourites.data.total}
				{$favourites.data.total === 1 ? 'favourite' : 'favourites'}
			</p>
		{/if}
	</div>

	<Separator class="mb-6" />

	{#if $favourites.isLoading}
		<!-- Loading skeleton -->
		<div class="flex items-center justify-center py-12">
			<LoaderCircle class="text-primary size-8 animate-spin" />
		</div>
	{:else if $favourites.isError}
		<!-- Error state -->
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
			Failed to load favourites. Please try again.
		</div>
	{:else if $favourites.data && $favourites.data.data.length === 0}
		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="mb-2 text-lg font-medium text-gray-900">No favourites yet</p>
			<p class="text-sm text-gray-600">
				Start exploring and save your favourite dog-friendly places
			</p>
		</div>
	{:else}
		<!-- Grid of favourites -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each $favourites.data && $favourites.data.data as place (place.id)}
				<PlaceCard
					{place}
					onUnfavouriteClick={handleUnfavouriteClick}
					unfavouritePending={pendingUnfavouritePlaceId === place.id}
				/>
			{/each}
		</div>
		<!-- Pagination controls -->
		{#if $favourites.data && totalPages > 1}
			<Pagination.Root
				count={$favourites.data.total}
				perPage={limit}
				page={currentPage}
				onPageChange={handlePageChange}
				class="mt-8"
			>
				{#snippet children({ pages, currentPage: activePage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={activePage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		{/if}
	{/if}
</div>
