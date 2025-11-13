<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();
</script>

<div class="flex h-full flex-col">
	<!-- Header with close button -->
	<div class="flex items-center justify-between border-b p-4">
		<div class="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
		<Button variant="ghost" size="icon" onclick={onClose}>
			<X class="h-5 w-5" />
		</Button>
	</div>

	<!-- Image skeleton -->
	<div class="relative h-64 w-full animate-pulse bg-gray-200"></div>

	<!-- Content skeleton -->
	<div class="flex-1 overflow-y-auto p-6">
		<!-- Title and rating -->
		<div class="mb-4 space-y-3">
			<div class="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
			<div class="flex items-center gap-2">
				<div class="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
				<div class="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
			</div>
		</div>

		<!-- Badges -->
		<div class="mb-6 flex gap-2">
			<div class="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
			<div class="h-6 w-20 animate-pulse rounded-full bg-gray-200"></div>
			<div class="h-6 w-24 animate-pulse rounded-full bg-gray-200"></div>
		</div>

		<!-- Description -->
		<div class="mb-6 space-y-2">
			<div class="h-4 w-full animate-pulse rounded bg-gray-200"></div>
			<div class="h-4 w-full animate-pulse rounded bg-gray-200"></div>
			<div class="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
		</div>

		<!-- Info sections -->
		<div class="space-y-4">
			<!-- Address -->
			<div class="space-y-2">
				<div class="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
				<div class="h-4 w-full animate-pulse rounded bg-gray-200"></div>
			</div>

			<!-- Hours -->
			<div class="space-y-2">
				<div class="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
				<div class="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
			</div>

			<!-- Contact -->
			<div class="space-y-2">
				<div class="h-5 w-28 animate-pulse rounded bg-gray-200"></div>
				<div class="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
			</div>
		</div>
	</div>

	<!-- Action buttons -->
	<div class="border-t p-4">
		<div class="flex gap-3">
			<div class="h-10 flex-1 animate-pulse rounded-lg bg-gray-200"></div>
			<div class="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
		</div>
	</div>
</div>
