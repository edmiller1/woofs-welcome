<script lang="ts">
	import { Star } from '@lucide/svelte';

	interface Props {
		className?: string;
		rating: number;
	}

	const { className = '', rating }: Props = $props();

	const stars = Array.from({ length: 5 }, (_, i) => i + 1);
</script>

<div class={`flex ${className}`}>
	{#each stars as star}
		<Star
			class={`size-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
		/>
	{/each}
</div>
