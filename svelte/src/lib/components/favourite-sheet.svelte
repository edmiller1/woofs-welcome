<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Heart } from '@lucide/svelte';
	import { Button } from './ui/button';
	import { api } from '$lib/api';
	import { createQuery } from '@tanstack/svelte-query';

	const favourites = createQuery({
		queryKey: ['favourites'],
		queryFn: api.auth.getFavourites
	});
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<!-- Favourites Icon -->
		<Button variant="ghost" size="icon">
			<Heart class="h-5 w-5" />
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title class="flex items-center gap-2"
				><Heart class="h-5 w-5 fill-rose-500 text-rose-500" />Favourites</Sheet.Title
			>
			<Sheet.Description>View and update your favourite places.</Sheet.Description>
		</Sheet.Header>
		{#if $favourites.isLoading}
			<div class="text-muted-foreground p-4 text-center text-sm">Loading favourites...</div>
		{:else if $favourites.error}
			<div class="p-4 text-center text-sm text-red-500">Error loading favourites.</div>
		{:else if $favourites.data && $favourites.data.length === 0}
			<div class="text-muted-foreground p-4 text-center text-sm">You have no favourite places.</div>
		{:else if $favourites.data}
			<div class="my-6 grid grid-cols-2 gap-5 p-4">
				{#each $favourites.data as favourite}
					<a href={`/place/${favourite.slug}`}>
						<img
							src={favourite.images[0].url}
							alt={favourite.images[0].altText}
							class="h-32 w-full rounded-lg object-cover object-center transition-transform duration-200 hover:scale-105"
						/>
						<div>
							<span class="truncate text-xs">{favourite.name}</span>
							<div class="text-muted-foreground text-xs">
								{favourite.city.name}, {favourite.city.region.name}
							</div>
						</div>
					</a>
				{/each}
			</div>
			<div class="mx-auto flex w-full items-end justify-center p-4">
				<Button variant="outline" class="w-full">View all</Button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
