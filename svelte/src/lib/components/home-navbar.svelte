<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import UserNav from './user-nav.svelte';
	import { slide } from 'svelte/transition';
	import type { BAUser } from '$lib/types/user';
	import BusinessNav from './business-nav.svelte';

	const { user }: { user: BAUser | null } = $props();

	let mobileMenuOpen = $state<boolean>(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		// Prevent body scroll when menu is open
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
</script>

<nav class="relative bg-white shadow-sm">
	<div class="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between">
			<div class="flex">
				<a href="/" class="flex items-center gap-2">
					<div class="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
						<span class="text-primary-foreground text-lg font-bold">🐕</span>
					</div>
					<span class="text-foreground text-xl font-bold">Woofs Welcome</span>
				</a>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					<a
						href="/"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						>About</a
					>

					<a
						href="/"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						>FAQs</a
					>

					<a
						href="/"
						class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						>Blog</a
					>
				</div>
			</div>
			<div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
				<a href="/business" class={cn(buttonVariants({ variant: 'default' }), 'rounded-full')}
					>For Businesses</a
				>
				<a href="/" class={cn(buttonVariants({ variant: 'green' }), 'rounded-full')}
					>Download the App</a
				>
				{#if user}
					{#if user.activeContext === 'personal'}
						<UserNav {user} />
					{:else}
						<BusinessNav {user} />
					{/if}
				{:else}
					<a href="/sign-in" class={cn(buttonVariants({ variant: 'default' }), 'rounded-full')}
						>Sign in</a
					>
				{/if}
			</div>
			<div class="-mr-2 flex items-center sm:hidden">
				<!-- Mobile menu button -->
				<button
					type="button"
					onclick={toggleMobileMenu}
					class="focus:outline-primary relative inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-2 focus:-outline-offset-1"
				>
					<span class="absolute -inset-0.5"></span>
					<span class="sr-only">Open main menu</span>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						data-slot="icon"
						aria-hidden="true"
						class="{mobileMenuOpen ? 'hidden' : 'block'} size-6"
					>
						<path
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						data-slot="icon"
						aria-hidden="true"
						class="{mobileMenuOpen ? 'block' : 'hidden'} size-6"
					>
						<path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu overlay -->
	{#if mobileMenuOpen}
		<div
			class="fixed inset-0 z-50 bg-white sm:hidden dark:bg-gray-900"
			transition:slide={{ duration: 300 }}
		>
			<!-- Header with close button -->
			<div
				class="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700"
			>
				<div class="flex shrink-0 items-center">
					<img
						src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
						alt="Your Company"
						class="h-8 w-auto dark:hidden"
					/>
					<img
						src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
						alt="Your Company"
						class="not-dark:hidden h-8 w-auto"
					/>
				</div>
				<button
					type="button"
					onclick={toggleMobileMenu}
					class="focus:outline-primary relative inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-2 focus:-outline-offset-1"
				>
					<span class="sr-only">Close menu</span>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						class="size-6"
					>
						<path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
			</div>

			<!-- Menu content -->
			<div class="flex h-full flex-col overflow-y-auto">
				<div class="flex-1 px-4 py-6">
					<div class="space-y-6">
						<div class="space-y-4">
							<a href="/" class="hover:text-primary block text-lg font-medium text-gray-900">
								About
							</a>
							<a href="/" class="hover:text-primary block text-lg font-medium text-gray-900">
								FAQs
							</a>
							<a href="/" class="hover:text-primary block text-lg font-medium text-gray-900">
								Blog
							</a>
						</div>

						<div class="border-t border-gray-200 pt-6 dark:border-gray-700">
							<div class="space-y-4">
								<p class="text-sm text-gray-600 dark:text-gray-400">
									Get the Woofs Welcome App. Free on iOS or Android.
								</p>
								<div class="space-y-3">
									<a
										href="/business"
										class={cn(buttonVariants({ variant: 'default' }), 'w-full rounded-full')}
									>
										For Businesses
									</a>
									<button class={cn(buttonVariants({ variant: 'green' }), 'w-full rounded-full')}>
										Download the App
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</nav>
