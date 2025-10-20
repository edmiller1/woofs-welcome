<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth, needsProfileCompletion } from '$lib/auth/stores';
	import { authModalActions } from '$lib/auth/auth-modal-store';
	import { toast } from 'svelte-sonner';
	import { LoaderCircle } from '@lucide/svelte';

	let status = $state('processing');

	onMount(async () => {
		try {
			const success = await auth.handleOAuthCallback();

			if (success) {
				status = 'success';

				// Wait for stores to update
				await new Promise((resolve) => setTimeout(resolve, 200));

				// Check if user needs to complete profile
				if ($needsProfileCompletion) {
					authModalActions.setStep('welcome');
					authModalActions.open('sign-in');
					goto('/');
				} else {
					toast.success('Successfully signed in!');
					// Redirect handled in handleOAuthCallback
				}
			} else {
				status = 'error';
				toast.error('Sign in failed');
				goto('/');
			}
		} catch (error) {
			console.error('OAuth callback error:', error);
			status = 'error';
			toast.error('Sign in failed');
			goto('/');
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-center gap-4 text-center">
		{#if status === 'processing'}
			<LoaderCircle class="text-primary size-10 animate-spin" />
			<p>Completing sign in...</p>
		{:else if status === 'success'}
			<p class="text-green-600">Sign in successful!</p>
		{:else}
			<p class="text-red-600">Sign in failed. Redirecting...</p>
		{/if}
	</div>
</div>
