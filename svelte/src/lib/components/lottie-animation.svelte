<script lang="ts">
	import { cn } from '$lib/utils';
	import { DotLottieSvelte, type Data } from '@lottiefiles/dotlottie-svelte';

	interface Props {
		loop: boolean;
		autoplay: boolean;
		animationData?: Data;
		className?: string;
	}

	let { loop, autoplay, animationData, className }: Props = $props();
</script>

<div class={cn(className)}>
	<DotLottieSvelte data={animationData} loop autoplay />
</div>
