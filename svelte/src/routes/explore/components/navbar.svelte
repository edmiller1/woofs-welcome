<script lang="ts">
	import type { BAUser } from '$lib/types/models';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Search, Bell, MessageSquare, Heart } from '@lucide/svelte';
	import { getUserInitials } from '$lib/helpers';
	import UserNav from '$lib/components/user-nav.svelte';
	import NavbarSearch from '$lib/components/navbar-search.svelte';
	import FavouriteSheet from '$lib/components/favourite-sheet.svelte';

	interface Props {
		user: BAUser | null;
	}

	let { user }: Props = $props();
</script>

<nav class="sticky top-0 z-50 w-full border-b bg-white">
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
		</div>
	</div>
</nav>
