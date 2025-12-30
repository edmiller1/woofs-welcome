<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Dog } from '@lucide/svelte';
	import fluffs from '$lib/assets/fluffs.jpg';
	import SignInForm from './components/sign-in-form.svelte';
	import { onMount } from 'svelte';

	const redirectTo = $derived(page.url.searchParams.get('redirect') || '/');
	const isBusiness = $derived(page.url.searchParams.get('business') === 'true');

	onMount(() => {
		if (isBusiness) {
			sessionStorage.setItem('onboarding_type', 'business');
		}
	});
</script>

<svelte:head>
	<title>Sign in</title>
	<meta name="description" content="Sign in to your account." />
</svelte:head>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-between gap-2">
			<a href="/" class="flex items-center gap-2 font-medium">
				<div
					class="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full"
				>
					<Dog class="size-4" />
				</div>
				Woofs Welcome
			</a>
			<a href="/sign-in?business=true" class={buttonVariants({ variant: 'link' })}>
				Create a business account
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<SignInForm {redirectTo} {isBusiness} />
			</div>
		</div>
	</div>
	<div class="bg-muted relative hidden lg:block">
		<img
			src={fluffs}
			alt="doggies"
			class="absolute inset-0 h-full w-full object-cover object-center"
		/>
	</div>
</div>
