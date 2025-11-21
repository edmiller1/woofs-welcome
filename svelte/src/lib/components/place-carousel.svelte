<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import type { IslandPlace } from '$lib/types/models';
	import { Badge } from '$lib/components/ui/badge';
	import { Heart, Star } from '@lucide/svelte';

	interface Props {
		title: string;
		places: IslandPlace[];
	}

	const { title, places }: Props = $props();
</script>

<div class="my-6">
	<Carousel.Root
		class="w-full"
		opts={{
			align: 'start',
			loop: false,
			dragFree: true
		}}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<h2 class="text-lg font-semibold">{title}</h2>
				<a href="/" class={buttonVariants({ variant: 'link' })}>View all</a>
			</div>
			{#if places.length > 3}
				<div class="flex items-center gap-2">
					<Carousel.Previous class="static h-8 w-8 translate-x-0 translate-y-0" />
					<Carousel.Next class="static h-8 w-8 translate-x-0 translate-y-0" />
				</div>
			{/if}
		</div>

		<Carousel.Content class="-ml-2 md:-ml-4">
			{#each places as place}
				<Carousel.Item class="basis-[280px] pl-2 md:basis-[320px] md:pl-4">
					<Card.Root class="bg-background border-0 shadow-none">
						<div class="group relative cursor-pointer">
							<a href={`/place/${place.slug}`} class="block no-underline" aria-label={place.name}>
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
										<h3 class="truncate font-medium">{place.name}</h3>
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
								>
									<Heart class="size-6" />
								</Button>
							</div>
						</div>
					</Card.Root>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
