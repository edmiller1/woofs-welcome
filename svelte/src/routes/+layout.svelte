<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { auth, loading } from '$lib/auth/stores';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Loader2 } from '@lucide/svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { browser } from '$app/environment';
	import AuthModal from '$lib/components/auth-modal.svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				retry: 1,
				staleTime: 5 * 60 * 1000
			}
		}
	});

	let { children } = $props();

	onMount(() => {
		auth.initialize();
	});
</script>

<QueryClientProvider client={queryClient}>
	{#if $loading}
		<div class="flex min-h-screen items-center justify-center">
			<Loader2 class="text-primary size-10 animate-spin" />
		</div>
	{:else}
		{@render children()}
	{/if}
	<AuthModal />
	<Toaster />
	<!-- <SvelteQueryDevtools /> -->
</QueryClientProvider>
