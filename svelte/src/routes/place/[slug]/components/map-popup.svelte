<script lang="ts">
	import type { PlaceWithDistance } from '$lib/types/models';
	import type { GetPlaceResponse } from '$lib/types/responses';
	import { cn } from '$lib/utils';
	import { ChevronLeft, ChevronRight, Heart, Star, XIcon } from '@lucide/svelte';

	interface Props {
		activePlace: GetPlaceResponse | PlaceWithDistance;
		closePopup: () => void;
	}

	let { activePlace, closePopup }: Props = $props();

	let showRightArrow = $state<boolean>(false);
	let showLeftArrow = $state<boolean>(false);
	let currentIndex = $state<number>(0);

	const showArrows = () => {
		if (activePlace.images.length <= 1) return;

		if (currentIndex === 0) {
			showRightArrow = true;
			showLeftArrow = false;
		} else if (currentIndex === activePlace.images.length - 1) {
			showLeftArrow = true;
			showRightArrow = false;
		} else {
			showLeftArrow = true;
			showRightArrow = true;
		}
	};

	const hideArrows = () => {
		showLeftArrow = false;
		showRightArrow = false;
	};

	const nextImage = () => {
		if (currentIndex < activePlace.images.length - 1) {
			currentIndex++;
		}
	};

	const prevImage = () => {
		if (currentIndex > 0) {
			currentIndex--;
		}
	};
</script>

<div class="visible z-[99] flex rounded-xl bg-white sm:w-[327px] sm:flex-col">
	<div
		class="relative overflow-hidden rounded-t-xl"
		role="img"
		aria-label="Popup image"
		onmouseenter={showArrows}
		onmouseleave={hideArrows}
		onfocus={showArrows}
		onblur={hideArrows}
	>
		{#if activePlace.images && activePlace.images.length > 0}
			<div
				class="flex transition-transform duration-500 ease-out"
				style="transform: translateX(-{currentIndex * 100}%)"
			>
				{#each activePlace.images as image}
					<img
						src={image.url}
						alt={image.altText || 'Place image'}
						class="popup-card-image h-52 w-full flex-shrink-0 object-cover object-center"
					/>
				{/each}
			</div>
		{:else}
			<div class="flex h-52 w-72 items-center justify-center bg-gray-200">
				<span class="text-gray-500">No images available</span>
			</div>
		{/if}

		<a href={`/place/${activePlace.slug}`} aria-label="View place details" target="_blank">
			<div class="absolute inset-0 z-10 flex cursor-pointer items-start justify-end p-2"></div>
		</a>

		{#if activePlace.isFavourited}
			<div class="absolute right-2 top-2 z-10 flex">
				<Heart class="size-6 fill-rose-500 text-rose-500" />
			</div>
		{/if}

		<button onclick={closePopup} class="absolute left-2 top-2 z-10 flex cursor-pointer">
			<XIcon class="rounded-full bg-white fill-white p-1 opacity-80 hover:opacity-100" />
		</button>

		{#if showLeftArrow}
			<div class="absolute left-2 top-[45%] z-20">
				<button
					onclick={prevImage}
					class="rounded-full bg-white/80 p-1 text-gray-800 shadow transition-all hover:bg-white focus:outline-none"
					aria-label="Previous image"
				>
					<ChevronLeft class="size-6" />
				</button>
			</div>
		{/if}

		{#if showRightArrow}
			<div class="absolute right-2 top-[45%] z-20">
				<button
					onclick={nextImage}
					class="rounded-full bg-white/80 p-1 text-gray-800 shadow transition-all hover:bg-white focus:outline-none"
					aria-label="Next image"
				>
					<ChevronRight class="size-6" />
				</button>
			</div>
		{/if}

		{#if activePlace.images && activePlace.images.length > 1}
			<div class="absolute bottom-4 left-0 right-0 z-20">
				<div class="flex items-center justify-center gap-2">
					{#each activePlace.images as _, index}
						<button
							onclick={() => (currentIndex = index)}
							class={cn(
								'size-2 rounded-full bg-white transition-all',
								currentIndex === index ? 'scale-125' : 'opacity-50'
							)}
							aria-label={`Go to image ${index + 1}`}
						></button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div class="rounded-b-xl bg-white p-2 text-black">
		<div class="flex items-center justify-between">
			<span class="mt-1 text-[1.01rem] font-bold">
				{activePlace.name}
			</span>
			<div class="mt-1 flex items-center space-x-1 text-[1.01rem]">
				<Star class="size-4 fill-yellow-500 text-yellow-500" />
				<span class="text-black">{Number(activePlace.rating).toFixed(1)}</span>
			</div>
		</div>
	</div>
</div>
