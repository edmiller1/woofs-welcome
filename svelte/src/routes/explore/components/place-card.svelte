<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { BadgeCheck, Heart, LoaderCircle, Star } from '@lucide/svelte';
	import type { PlaceWithOptimizedImages } from '$lib/types/models';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { page } from '$app/state';

	interface Props {
		place: PlaceWithOptimizedImages;
		onCardClick: (place: PlaceWithOptimizedImages) => void;
		onFavouriteClick: (placeId: string) => void;
		favouritePending?: boolean;
	}

	let { place, onCardClick, onFavouriteClick, favouritePending }: Props = $props();

	let showArrows = $state<boolean>(false);

	// Check if this card is currently selected
	const isSelected = $derived(page.url.searchParams.get('place') === place.slug);

	const isFavourited = $derived(place.hasFavourited);

	// Get primary image or first image
	let images = $derived(place.images.length > 0 ? place.images : []);

	// Format rating
	let ratingValue = $derived(place.rating);

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

	// Handle favorite click
	function handleFavouriteClick(e: Event) {
		e.stopPropagation();
		onFavouriteClick(place.id);
	}

	// Handle card click
	function handleCardClick() {
		onCardClick(place);
	}

	function handleShowArrows() {
		showArrows = true;
	}

	function handleHideArrows() {
		showArrows = false;
	}

	function handleNextClick(e: Event) {
		e.stopPropagation();
		carouselApi!.scrollNext();
	}

	function handlePreviousClick(e: Event) {
		e.stopPropagation();
		carouselApi!.scrollPrev();
	}
</script>

<button class="m-0 flex w-full justify-center p-0" onclick={handleCardClick}>
	<div class="m-0 flex h-full max-w-sm cursor-pointer flex-col overflow-hidden p-0">
		<div class="relative w-full overflow-hidden rounded-lg">
			<Carousel.Root setApi={(emblaApi) => (carouselApi = emblaApi)}>
				<div
					role="button"
					tabindex="0"
					class="group relative cursor-pointer"
					onmouseenter={handleShowArrows}
					onmouseleave={handleHideArrows}
				>
					<Carousel.Content class="basis-[280px] md:basis-[320px]">
						{#each images as image}
							<Carousel.Item class="pl-3">
								<div
									class="relative aspect-[4/3] transition-transform duration-200 group-hover:scale-105"
								>
									<img
										src={image.webp.src}
										alt={image.altText}
										class="h-full w-full object-cover"
									/>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					{#if showArrows}
						<Carousel.Next onclick={handleNextClick} class="absolute right-2" />
						<Carousel.Previous onclick={handlePreviousClick} class="absolute left-2" />
					{/if}

					<!-- Selected indicator -->
					{#if isSelected}
						<div class="absolute left-2 top-2 rounded-md bg-[#4a9b76] px-2 py-1 text-xs text-white">
							Selected
						</div>
					{/if}

					<!-- Indicators -->
					<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
						{#each images as _, index}
							{@const isActive = current === index}
							<button
								class="size-2 cursor-pointer rounded-full bg-white {isActive
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
				</div>
			</Carousel.Root>
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
		<!-- Place Details -->
		<div class="space-y-3 py-2">
			<div class="m-0 flex items-center justify-between">
				<div class="flex items-center gap-1">
					<h3 class="truncate font-medium">{place.name}</h3>
					{#if place.isVerified}
						<BadgeCheck class="fill-primary size-4" />
					{/if}
				</div>
				<div class="flex items-center gap-1">
					<Star class="size-3 fill-yellow-500 text-yellow-500" />
					<span class="text-sm">{Number(place.rating).toFixed(1)}</span>
				</div>
			</div>
			<div class="text-muted-foreground m-0 text-left text-sm">
				{place.city.name}, {place.city.region.name}
			</div>
			<div class="mt-1 flex items-center gap-1">
				{#each place.types.sort((a, b) => a.localeCompare(b)) as type}
					<Badge class="rounded-full">{type}</Badge>
				{/each}
			</div>
		</div>
	</div>
</button>
