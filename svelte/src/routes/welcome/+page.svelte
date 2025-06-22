<script lang="ts">
	import { WelcomeLoader } from './components';
	import type { Session, SupabaseClient } from '@supabase/supabase-js';

	interface PageData {
		data: {
			session: Session | null;
			supabase: SupabaseClient;
		};
	}

	let pageData = $props() as PageData;

	let session = $derived(pageData.data?.session);
</script>

<svelte:head>
	<title>Signing in...</title>
	<meta name="description" content="Signing in..." />
</svelte:head>

<div class="flex min-h-screen w-full flex-1 items-center justify-center px-4">
	{#if session}
		<WelcomeLoader {session} />
	{:else}
		<div>Loading session...</div>
	{/if}
</div>
