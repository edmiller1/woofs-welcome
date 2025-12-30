<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { LoaderCircle } from '@lucide/svelte';

	onMount(() => {
		// Check sessionStorage for business flag
		const onboardingType = sessionStorage.getItem('onboarding_type');

		if (onboardingType === 'business') {
			// Add query param and let server handle redirect
			goto('/onboarding?business=true', { replaceState: true });
		}
		// Otherwise, server will handle regular redirect
	});
</script>

<svelte:head>
	<title>Setting up your account...</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="text-center">
		<LoaderCircle class="text-primary mx-auto h-12 w-12 animate-spin" />
		<p class="mt-4 text-sm text-gray-600">Setting up your account...</p>
	</div>
</div>
