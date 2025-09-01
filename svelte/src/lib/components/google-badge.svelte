<script lang="ts">
	import clsx from 'clsx';
	import GoogleG from './google-g.svelte';

	interface Props {
		className?: string;
	}

	const { className }: Props = $props();

	let open = $state<boolean>(false);
</script>

<div
	class={clsx(
		'absolute bottom-3 left-3 z-[50] flex cursor-pointer items-center overflow-hidden rounded-full bg-neutral-700 transition-all duration-300 ease-out',
		className
	)}
	style="width: {open ? '200px' : '40px'}; height: 40px;"
	role="button"
	tabindex="0"
	onmouseenter={() => (open = true)}
	onmouseleave={() => (open = false)}
>
	<div class="flex size-10 flex-shrink-0 items-center justify-center">
		<GoogleG className="size-5" />
	</div>
	<div
		class={clsx(
			'flex flex-1 items-center text-xs text-white transition-all duration-300',
			open ? 'opacity-100' : 'opacity-0'
		)}
	>
		Image sourced from Google
	</div>
</div>
