<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { auth, loading } from '$lib/auth/stores';
	import { page } from '$app/stores';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Loader2 } from '@lucide/svelte';

	const queryClient = new QueryClient();

	let { children } = $props();

	onMount(() => {
		auth.initialize();
	});
</script>

<QueryClientProvider client={queryClient}>
	<Toaster />
	{#if $loading}
		<div class="flex min-h-screen items-center justify-center">
			<Loader2 class="siz-10 text-primary animate-spin" />
		</div>
	{:else}
		{@render children()}
	{/if}
</QueryClientProvider>
