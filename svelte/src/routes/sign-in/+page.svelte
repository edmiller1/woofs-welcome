<script lang="ts">
	import { page } from '$app/state';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Dog } from '@lucide/svelte';
	import fluffs from '$lib/assets/fluffs.jpg';
	import SignInForm from './components/sign-in-form.svelte';

	const redirectTo = page.url.searchParams.get('redirect') || '/';
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
			<a href="/business/sign-up" class={buttonVariants({ variant: 'link' })}>
				Create a business account
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<SignInForm {redirectTo} />
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
