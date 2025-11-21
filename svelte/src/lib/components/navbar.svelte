<script lang="ts">
	import type { BAUser } from '$lib/types/models';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Bell,
		Coffee,
		Footprints,
		Hotel,
		Map,
		MapPin,
		Menu,
		ShoppingBag,
		Stethoscope,
		Ticket,
		Trees,
		Utensils,
		Waves
	} from '@lucide/svelte';
	import UserNav from '$lib/components/user-nav.svelte';
	import NavbarSearch from '$lib/components/navbar-search.svelte';
	import FavouriteSheet from '$lib/components/favourite-sheet.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { page } from '$app/state';

	interface Props {
		user: BAUser | null;
		currentPlace?: string;
	}

	const types = [
		{ name: 'Things to Do', href: '/explore?types=Activity', icon: MapPin },
		{ name: 'Accommodation', href: '/explore?types=AirBnb%2CHotel%2CMotel', icon: Hotel },
		{ name: 'Retail', href: '/explore?types=Store', icon: ShoppingBag },
		{ name: 'Restaurants', href: '/explore?types=Restaurant', icon: Utensils },
		{ name: 'Cafés', href: '/explore?types=Café', icon: Coffee },
		{ name: 'Services', href: '/explore?types=Service', icon: Stethoscope },
		{ name: 'Parks', href: '/explore?types=Dog+Park%2CPark', icon: Trees },
		{ name: 'Beaches', href: '/explore?types=Beach', icon: Waves },
		{ name: 'Walks', href: '/explore?types=Hike%2CTrail%2CWalk', icon: Footprints },
		{ name: 'Events', href: '/explore?types=Event', icon: Ticket }
	];

	let { user, currentPlace }: Props = $props();

	const explorePage = page.url.pathname.includes('/explore');
</script>

<nav class="bg-background sticky top-0 z-50 w-full border-b">
	<div class="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
		<div class="flex items-center gap-8">
			<!-- Logo/Brand -->
			<a href="/" class="flex items-center gap-2">
				<div class="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
					<span class="text-primary-foreground text-lg font-bold">🐕</span>
				</div>
				<span class="text-foreground text-xl font-bold">Woofs Welcome</span>
			</a>

			<!-- Navigation Links -->
			<div class="hidden items-center gap-1 md:flex">
				<a href="/explore">
					<Button variant="ghost" class="font-medium">Explore</Button>
				</a>
				<a href="/help">
					<Button variant="ghost" class="font-medium">Help</Button>
				</a>
			</div>
		</div>

		<!-- Center Section: Search -->
		<NavbarSearch />

		<!-- Right Section: Icons & User -->
		<div class="flex items-center gap-3">
			<!-- Notification Icon -->
			{#if user}
				<Button variant="ghost" size="icon" class="relative">
					<Bell class="h-5 w-5" />
					<span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
				</Button>

				<FavouriteSheet />
			{/if}

			<!-- User Section -->
			{#if user}
				<div class="ml-2 flex items-center gap-3 border-l pl-3">
					<div class="hidden flex-col items-end md:flex">
						<span class="text-sm font-semibold">{user.name || 'User'}</span>
						<span class="text-muted-foreground text-xs">{user.email}</span>
					</div>
					<UserNav {user} />
				</div>
			{:else}
				<Button variant="default" class="ml-2">Sign In</Button>
			{/if}
			<!-- Mobile Menu -->
			{#if !explorePage}
				<div class="relative z-10 -ml-3 flex items-center lg:hidden">
					<Sheet.Root>
						<Sheet.Trigger class={`${buttonVariants({ variant: 'ghost' })} ml-5`}>
							<Menu class="size-4" />
						</Sheet.Trigger>
						<Sheet.Content side="right" class="flex flex-col gap-2 p-4">
							<ul class="mt-5 border-b px-4 py-2">
								{#if currentPlace}
									<li class="-px-4 my-3">
										<div class="flex items-center gap-2 rounded-lg capitalize">
											<Map />
											{currentPlace}
										</div>
									</li>
								{/if}
								{#each types as type}
									<li class="my-3 text-sm">
										<a
											href={type.href}
											class="hover:bg-secondary hover:text-background flex items-center gap-2 rounded-lg px-2 py-1"
										>
											<type.icon class="size-3" />
											{type.name}
										</a>
									</li>
								{/each}
							</ul>
						</Sheet.Content>
					</Sheet.Root>
				</div>
			{/if}
		</div>
	</div>
	{#if !explorePage}
		<div class="hidden lg:flex lg:space-x-4 lg:py-2">
			{#each types as type}
				<a
					href={type.href}
					class="hover:bg-secondary hover:text-background flex cursor-pointer items-center gap-2 rounded-md px-3 py-1"
				>
					<type.icon class="size-4" />
					<span class=" text-sm font-medium">{type.name}</span>
				</a>
			{/each}
		</div>
	{/if}
</nav>
