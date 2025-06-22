<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	const queryClient = new QueryClient();

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				console.log('======= invalidate auth =======');
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});
</script>

<QueryClientProvider client={queryClient}>
	<Toaster />
	{@render children()}
</QueryClientProvider>
