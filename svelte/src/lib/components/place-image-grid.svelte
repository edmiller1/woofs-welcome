<script lang="ts">
	import type { PlaceImage } from '$lib/types/models';
	import GoogleBadge from './google-badge.svelte';
	import { Button } from './ui/button';

	interface Props {
		images: PlaceImage[];
		openImageDrawer: () => void;
	}

	const { images, openImageDrawer }: Props = $props();
</script>

<div
	class="group/gallery my-5 grid h-[600px] grid-cols-3 grid-rows-2 gap-3 overflow-hidden rounded-lg group-hover/gallery:overflow-visible"
>
	<!-- Large main image - spans 2 columns and 2 rows  -->
	<div class="group relative col-span-2 row-span-2 cursor-pointer">
		{#if images[0]}
			{#if images[0].source === 'google'}
				<GoogleBadge className="size-10" />
			{/if}
			<img
				src={images[0].url}
				alt={images[0].altText}
				class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
			/>
		{/if}
	</div>

	<!-- Top right image - explicitly spans 1 row -->
	{#if images[1]}
		<div class="group relative row-span-1 cursor-pointer">
			{#if images[1].source === 'google'}
				<GoogleBadge className="size-10" />
			{/if}
			<img
				src={images[1].url}
				alt={images[1].altText}
				class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
			/>
		</div>
	{/if}

	<!-- Bottom right image with overlay button - explicitly spans 1 row -->
	{#if images[2]}
		<div class="group relative row-span-1 cursor-pointer">
			{#if images[2].source === 'google'}
				<GoogleBadge className="size-5" />
			{/if}
			<img
				src={images[2].url}
				alt={images[2].altText}
				class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
			/>

			<div class="absolute bottom-4 right-4">
				<Button
					variant="secondary"
					class="rounded-lg bg-white/90 px-4 py-2 font-medium text-black shadow-lg backdrop-blur-sm hover:bg-white"
					onclick={openImageDrawer}
				>
					Show All Photos
					<span class="ml-2 text-sm">{images.length}</span>
				</Button>
			</div>
		</div>
	{/if}
</div>
