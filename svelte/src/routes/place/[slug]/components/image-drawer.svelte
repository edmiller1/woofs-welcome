<script lang="ts">
	import ImageScroll from '$lib/components/image-scroll.svelte';
	import { Drawer } from 'vaul-svelte';

	interface Props {
		imagesOpen: boolean;
		images: { url: string; altText: string }[];
	}

	let { imagesOpen, images }: Props = $props();
</script>

<Drawer.Root open={imagesOpen} onOpenChange={(open) => (imagesOpen = open)}>
	<Drawer.Portal>
		<Drawer.Overlay class="fixed inset-0 bg-black/40" />
		<Drawer.Content
			class="fixed bottom-0 left-0 right-0 z-[99] mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-zinc-100"
		>
			<div class="flex h-full flex-col rounded-t-[10px] bg-white">
				<!-- Fixed handle at top -->
				<div class="flex-shrink-0 p-4">
					<div class="mx-auto h-1.5 w-12 cursor-pointer rounded-full bg-zinc-300"></div>
				</div>

				<!-- Scrollable content -->
				<div class="flex-1 overflow-y-auto p-4 pt-8">
					<ImageScroll {images} />
				</div>
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
