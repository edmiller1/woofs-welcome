<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { ReviewImage } from '$lib/types/models';
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	interface Props {
		image: ReviewImage;
		images: ReviewImage[];
	}

	const { image, images }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<div class="group relative cursor-pointer overflow-hidden rounded-xl">
			<img
				src={image.url}
				alt={image.altText}
				class="group-hover:brightness-80 size-32 rounded-xl object-cover object-center transition-all duration-200"
			/>
		</div>
	</Dialog.Trigger>
	<Dialog.Content class="z-[99] m-10 w-full">
		<Carousel.Root class="w-full">
			<Carousel.Content>
				{#each images as image}
					<Carousel.Item class="relative">
						<div class="flex items-center justify-center">
							<img
								src={image.url}
								alt={image.altText}
								class="max-h-[400px] w-[400px] rounded-xl object-cover"
							/>
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			{#if images.length > 1}
				<Carousel.Previous class="absolute -left-2" />
				<Carousel.Next class="absolute -right-2" />
			{/if}
		</Carousel.Root>
	</Dialog.Content>
</Dialog.Root>
