<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		text?: string;
		class?: string;
	}

	let { size = 'md', text, class: className }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12'
	};
</script>

<div class={cn('flex items-center justify-center gap-3', className)}>
	<LoaderCircle class={cn('text-primary animate-spin', sizeClasses[size])} />
	{#if text}
		<span class="text-muted-foreground text-sm">{text}</span>
	{/if}
</div>
