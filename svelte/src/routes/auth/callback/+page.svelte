<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth/stores';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from '@lucide/svelte';

	let status = $state('processing');

	onMount(async () => {
		try {
			const success = await auth.handleOAuthCallback();

			if (success) {
				status = 'success';
				toast.success('Successfully signed in!');
				// Redirect will be handled in handleOAuthCallback
			} else {
				status = 'error';
				toast.error('Sign in failed');
				goto('/auth/signin');
			}
		} catch (error) {
			console.error('OAuth callback error:', error);
			status = 'error';
			toast.error('Sign in failed');
			goto('/auth/signin');
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-center gap-4 text-center">
		{#if status === 'processing'}
			<Loader2 class="text-primary size-10 animate-spin" />
			<p>Completing sign in...</p>
		{:else if status === 'success'}
			<p class="text-green-600">Sign in successful! Redirecting...</p>
		{:else}
			<p class="text-red-600">Sign in failed. Redirecting...</p>
		{/if}
	</div>
</div>
