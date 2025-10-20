<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		variant?: 'text' | 'circular' | 'rectangular';
	}

	let { class: className, variant = 'rectangular' }: Props = $props();

	const variantClasses = {
		text: 'h-4 w-full',
		circular: 'rounded-full',
		rectangular: 'rounded-md'
	};
</script>

<div
	class={cn('bg-muted animate-pulse', variantClasses[variant], className)}
	role="status"
	aria-label="Loading..."
></div>
