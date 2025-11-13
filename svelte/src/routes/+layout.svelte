<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { auth, loading } from '$lib/auth/stores';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { LoaderCircle } from '@lucide/svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { browser } from '$app/environment';
	import AuthModal from '$lib/components/auth-modal.svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { handleQueryError } from '$lib/hooks/use-query-error';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				retry: (failureCount, error) => {
					// Don't retry on client errors (4xx)
					if (error && typeof error === 'object' && 'isClientError' in error) {
						return false;
					}
					// Retry server errors up to 2 times
					return failureCount < 2;
				},
				staleTime: 5 * 60 * 1000,
				// ✅ ADD GLOBAL ERROR HANDLER
				throwOnError: false // Don't throw in render
			},
			mutations: {
				// ✅ ADD GLOBAL ERROR HANDLER
				onError: handleQueryError
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
			<LoaderCircle class="text-primary size-10 animate-spin" />
		</div>
	{:else}
		{@render children()}
	{/if}
	<AuthModal />
	<Toaster />
	<!-- <SvelteQueryDevtools /> -->
</QueryClientProvider>
