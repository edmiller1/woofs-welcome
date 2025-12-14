<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { BadgeCheck, Heart, LoaderCircle, Star } from '@lucide/svelte';
	import type { FilterablePlace, PlaceWithOptimizedImages } from '$lib/types/models';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { page } from '$app/state';

	interface Props {
		place: FilterablePlace;
		onFavouriteClick: (placeId: string) => void;
		favouritePending?: boolean;
	}

	let { place, onFavouriteClick, favouritePending }: Props = $props();

	const isFavourited = $derived(place.hasFavourited);

	// Handle favorite click
	function handleFavouriteClick(e: Event) {
		e.stopPropagation();
		onFavouriteClick(place.id);
	}
</script>

<a href={`/place/${place.slug}`} class="m-0 flex w-full justify-center p-0">
	<div class="m-0 flex h-full max-w-sm cursor-pointer flex-col overflow-hidden p-0">
		<div class="relative w-full overflow-hidden rounded-lg">
			<div class="group basis-[280px] md:basis-[320px]">
				<div class="relative aspect-[4/3] transition-transform duration-200 group-hover:scale-105">
					<picture>
						<source
							type="image/webp"
							srcset={place.imageUrl.webp.srcset}
							sizes={place.imageUrl.sizes}
						/>
						<img
							src={place.imageUrl.src}
							srcset={place.imageUrl.srcset}
							sizes={place.imageUrl.sizes}
							alt={place.name}
							loading="lazy"
							decoding="async"
							class="h-full w-full rounded-lg object-cover"
						/>
					</picture>
					<!-- Heart Button -->
					<div class="absolute right-2 top-2 z-10">
						<Button
							variant="ghost"
							size="icon"
							class="rounded-full bg-white/80 hover:bg-white"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleFavouriteClick(e);
							}}
						>
							{#if favouritePending}
								<LoaderCircle class="size-6 animate-spin" />
							{:else}
								<Heart class={`size-6 ${isFavourited ? 'fill-rose-500 text-rose-500' : ''}`} />
							{/if}
						</Button>
					</div>
				</div>
				<div class="space-y-3 py-2">
					<div class="m-0 flex items-center justify-between">
						<div class="flex items-center gap-1">
							<h3 class="truncate font-medium">{place.name}</h3>
							<BadgeCheck class="fill-primary size-4" />
						</div>
						<div class="flex items-center gap-1">
							<Star class="size-3 fill-yellow-500 text-yellow-500" />
							<span class="text-sm">{Number(place.rating).toFixed(1)}</span>
						</div>
					</div>
					<div class="text-muted-foreground m-0 text-left text-sm">
						{place.cityName}, {place.regionName}
					</div>
					<div class="mt-1 flex items-center gap-1">
						{#each place.types.sort((a, b) => a.localeCompare(b)) as type}
							<Badge class="rounded-full">{type}</Badge>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</a>
