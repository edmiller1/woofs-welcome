<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { City } from '$lib/types/models';

	interface Props {
		heading: string;
		cities: City[];
	}

	let { heading, cities }: Props = $props();
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
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-2xl font-semibold">{heading}</h2>
			{#if cities.length > 3}
				<!-- Only show navigation buttons if there are more than 3 cities -->
				<div class="flex items-center gap-2">
					<Carousel.Previous class="static h-8 w-8 translate-x-0 translate-y-0" />
					<Carousel.Next class="static h-8 w-8 translate-x-0 translate-y-0" />
				</div>
			{/if}
		</div>

		<Carousel.Content class="-ml-2 md:-ml-4">
			{#each cities as city}
				<Carousel.Item class="basis-[280px] pl-2 md:basis-[320px] md:pl-4">
					<a href={`/city/${city.slug}`} class="no-underline">
						<Card.Root class="border-0 shadow-none">
							<div class="group relative cursor-pointer">
								<div class="relative aspect-[4/3] overflow-hidden rounded-xl">
									<img
										src={city.optimizedImage.src}
										alt={city.name}
										srcset={city.optimizedImage.srcset}
										sizes={city.optimizedImage.sizes}
										loading="lazy"
										class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
									/>
								</div>
								<div class="space-y-1 pt-1">
									<div class="flex items-center justify-between">
										<h3 class="truncate font-medium text-gray-900">{city.name}</h3>
									</div>
								</div>
							</div>
						</Card.Root>
					</a>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</div>
