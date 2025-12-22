<script lang="ts">
	import { CircleAlert } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		errors: Record<string, string>;
		field: string;
		class?: string;
	}

	let { errors, field, class: className }: Props = $props();

	const error = $derived(errors[field]);
</script>

{#if error}
	<div class={cn('flex items-center gap-2 text-sm text-red-600', className)}>
		<CircleAlert class="h-4 w-4" />
		<span>{error}</span>
	</div>
{/if}
