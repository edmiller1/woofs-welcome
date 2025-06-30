<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import type { BAUser } from '$lib/types/models';
	import { cn } from '$lib/utils';
	import { Dog, Menu } from '@lucide/svelte';
	import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
	import UserNav from './user-nav.svelte';

	const { user }: { user: BAUser | null } = $props();
</script>

<header class="bg-background flex h-16 w-full shrink-0 items-center border-b px-4 md:px-6">
	<Sheet>
		<SheetTrigger>
			<Button variant="outline" size="icon" class="lg:hidden">
				<Menu class="size-6" />
				<span class="sr-only">Toggle navigation menu</span>
			</Button>
		</SheetTrigger>
		<SheetContent side="right">
			<a href="/" class="flex items-center gap-2">
				<Dog class="text-primary size-6" />
				<span class="text-primary text-xl font-bold">Woofs Welcome</span>
			</a>
			<div class="grid gap-2 py-6">
				<a href="/discover" class="flex w-full items-center py-2 text-lg font-semibold">
					Discover
				</a>
				<a href="/about-us" class="flex w-full items-center py-2 text-lg font-semibold">
					About Us
				</a>
				<a href="/reviews" class="flex w-full items-center py-2 text-lg font-semibold"> Reviews </a>
				<a href="/blog" class="flex w-full items-center py-2 text-lg font-semibold">Blog</a>
				{#if user}
					<a href="/profile" class="flex w-full items-center py-2 text-lg font-semibold">
						Profile
					</a>
				{:else}
					<div class="mt-4 flex flex-col gap-2">
						<a href="/sign-in" class={cn(buttonVariants({ variant: 'outline' }))}>Sign in</a>
						<a href="/business" class={cn(buttonVariants({ variant: 'default' }))}
							>Claim a business</a
						>
					</div>
				{/if}
			</div>
		</SheetContent>
	</Sheet>

	<a href="/" class="mr-6 flex items-center gap-2">
		<Dog class="text-primary size-6" />
		<span class="text-primary hidden text-2xl font-bold sm:block">Woofs Welcome</span>
	</a>

	<NavigationMenu.Root class="hidden lg:flex">
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Link class="w-full rounded-md px-4 py-2">
					<a href="/about-us">About</a>
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger class="cursor-pointer">Explore</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div class="grid w-[500px] grid-cols-2 p-2">
						<NavigationMenu.Link class="rounded-md">
							<a
								href="/explore/accommodation"
								class="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
								><div class="text-sm font-medium leading-none group-hover:underline">
									Accommodation
								</div>
								<div class="text-muted-foreground line-clamp-2 text-sm leading-snug">
									Find dog-friendly hotels, B&Bs, and vacation rentals.
								</div>
							</a>
						</NavigationMenu.Link>
						<NavigationMenu.Link class="rounded-md">
							<a
								href="/explore/things-to-do"
								class="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
								><div class="text-sm font-medium leading-none group-hover:underline">
									Things to Do
								</div>
								<div class="text-muted-foreground line-clamp-2 text-sm leading-snug">
									Discover activities and attractions that welcome dogs.
								</div>
							</a>
						</NavigationMenu.Link>
						<NavigationMenu.Link class="rounded-md">
							<a
								href="/explore/dining"
								class="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
								><div class="text-sm font-medium leading-none group-hover:underline">Dining</div>
								<div class="text-muted-foreground line-clamp-2 text-sm leading-snug">
									Find restaurants and cafes that welcome your furry friend.
								</div>
							</a>
						</NavigationMenu.Link>
						<NavigationMenu.Link class="rounded-md">
							<a
								href="/explore/shopping"
								class="group grid h-auto w-full items-center justify-start gap-1 rounded-md p-4 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50"
								><div class="text-sm font-medium leading-none group-hover:underline">Shopping</div>
								<div class="text-muted-foreground line-clamp-2 text-sm leading-snug">
									Explore pet stores, boutiques, and markets that welcome dogs.
								</div>
							</a>
						</NavigationMenu.Link>
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link class="w-full rounded-md px-4 py-2">
					<a href="/reviews">Reviews </a>
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link class="w-full rounded-md px-4 py-2">
					<a href="/blog">Blog </a>
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>

	{#if user}
		<UserNav {user} className="ml-auto" />
	{:else}
		<div class="ml-auto flex gap-2">
			<a href="/sign-in" class={cn(buttonVariants({ variant: 'outline' }))}>Sign in</a>
			<a href="/business" class={cn(buttonVariants({ variant: 'default' }), 'hidden sm:inline')}
				>Claim your business</a
			>
			<a href="/business" class={cn(buttonVariants({ variant: 'default' }), 'sm:hidden')}
				>Claim your business</a
			>
		</div>
	{/if}
</header>
