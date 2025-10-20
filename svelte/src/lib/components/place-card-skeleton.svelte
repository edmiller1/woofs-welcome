<script lang="ts">
	import LoadingSkeleton from './loading-skeleton.svelte';
</script>

<div class="overflow-hidden rounded-lg border bg-white shadow-sm">
	<!-- Image skeleton -->
	<LoadingSkeleton class="h-48 w-full rounded-none" />

	<div class="p-4">
		<!-- Title skeleton -->
		<LoadingSkeleton class="mb-2 h-6 w-3/4" />

		<!-- Location skeleton -->
		<LoadingSkeleton class="mb-4 h-4 w-1/2" />

		<!-- Rating skeleton -->
		<div class="flex items-center gap-2">
			<LoadingSkeleton class="h-4 w-20" />
			<LoadingSkeleton class="h-4 w-16" />
		</div>
	</div>
</div>
