<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { Place } from '$lib/types/models';
	import { Heart, Star } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';
	import type { CarouselAPI } from './ui/carousel/context';
	import { Badge } from './ui/badge';

	interface Props {
		place: Place;
	}

	const { place }: Props = $props();

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

<a href={`/place/${place.slug}`} class="m-0 flex w-full justify-center p-0">
	<div class="m-0 flex h-full max-w-sm cursor-pointer flex-col overflow-hidden p-0">
		<div class="relative w-full overflow-hidden rounded-xl">
			<Carousel.Root setApi={(emblaApi) => (carouselApi = emblaApi)} class="rounded-xl">
				<div class="group relative cursor-pointer">
					<Carousel.Content class="basis-[280px] md:basis-[320px]">
						{#each place.images as image}
							<Carousel.Item class="pl-3">
								<div
									class="relative aspect-[4/3] transition-transform duration-200 group-hover:scale-105"
								>
									<img src={image.url} alt={image.altText} class="h-full w-full object-cover" />
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					<!-- Indicators -->
					<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
						{#each place.images as _, index}
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
			<div class="absolute right-2 top-2 z-10">
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
					><Heart class="size-6" />
				</Button>
			</div>
		</div>
		<div class="space-y-3 py-2">
			<div class="m-0 flex items-center justify-between">
				<h3 class="truncate font-medium">{place.name}</h3>
				<div class="flex items-center gap-1">
					<Star class="size-3" fill="#000000" />
					<span class="text-sm">{Number(place.rating).toFixed(1)}</span>
				</div>
			</div>
			<div class="text-muted-foreground m-0 text-sm">
				{place.cityName}, {place.regionName}
			</div>
			<div class="mt-1 flex items-center gap-1">
				{#each place.types.sort((a, b) => a.localeCompare(b)) as type}
					<Badge class="rounded-full">{type}</Badge>
				{/each}
			</div>
		</div>
	</div>
</a>
