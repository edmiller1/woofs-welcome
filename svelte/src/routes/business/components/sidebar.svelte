<script lang="ts">
	import { page } from '$app/state';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getUserInitials } from '$lib/helpers';
	import type { BAUser } from '$lib/types/user';
	import {
		ChevronDown,
		Heart,
		LayoutDashboard,
		MapPinHouse,
		Newspaper,
		Settings,
		UserStar
	} from '@lucide/svelte';

	interface Props {
		user: BAUser;
	}

	interface NavItem {
		name: string;
		href: string;
		icon: any;
		children?: Array<{
			name: string;
			href: string;
		}>;
	}

	const { user }: Props = $props();

	const business = $derived(user.business);

	const navItems = [
		{
			name: 'Dashboard',
			href: '/business/dashboard',
			icon: LayoutDashboard
		},
		{
			name: 'Claims',
			href: '/business/dashboard/claims',
			icon: Newspaper
		},
		{
			name: 'Places',
			href: '/business/dashboard/places',
			icon: MapPinHouse
		},
		{
			name: 'Favourites',
			href: '/business/dashboard/favourites',
			icon: Heart
		},
		{
			name: 'Reviews',
			href: '/business/dashboard/reviews',
			icon: UserStar
		},
		{
			name: 'Settings',
			href: '/business/dashboard/settings',
			icon: Settings,
			children: [
				{
					name: 'Account',
					href: '/business/dashboard/settings'
				},
				{
					name: 'Notifications',
					href: '/business/dashboard/settings/notifications'
				}
			]
		}
	];

	let expandedSections = $state<Set<string>>(new Set());

	const toggleSection = (name: string) => {
		const newExpanded = new Set(expandedSections);
		if (newExpanded.has(name)) {
			newExpanded.delete(name);
		} else {
			newExpanded.add(name);
		}
		expandedSections = newExpanded;
	};

	// Check if parent item should be active
	const isParentActive = (item: NavItem) => {
		if (item.href === '/business/dashboard') {
			return page.url.pathname === '/business/dashboard';
		}
		return page.url.pathname.startsWith(item.href);
	};

	// Check if child item is active
	const isChildActive = (href: string) => {
		return page.url.pathname === href;
	};

	// Auto-expand section if a child is active
	$effect(() => {
		navItems.forEach((item) => {
			if (item.children) {
				const hasActiveChild = item.children.some((child) => page.url.pathname === child.href);
				if (hasActiveChild && !expandedSections.has(item.name)) {
					expandedSections = new Set([...expandedSections, item.name]);
				}
			}
		});
	});
</script>

<aside class="hidden h-full w-64 flex-shrink-0 overflow-y-auto border-r bg-white md:block">
	<div class="flex h-full flex-col p-6">
		<div class="mb-10 flex items-center gap-3">
			<div class="relative">
				<Avatar.Root class="h-12 w-12 border-2 border-white shadow-sm">
					<Avatar.Image
						src={business.logoUrl?.responsive.sm}
						alt={business.name}
						class="object-cover object-center"
					/>
					<Avatar.Fallback>{getUserInitials(business.name)}</Avatar.Fallback>
				</Avatar.Root>
				<div
					class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-teal-500"
				></div>
			</div>
			<div>
				<h3 class="truncate text-sm font-bold">
					{business.name}
				</h3>
				<span class="text-muted-foreground text-xs">{business.email}</span>
			</div>
		</div>

		<nav class="flex-1 space-y-1">
			{#each navItems as item}
				{@const isActive = isParentActive(item)}
				{@const hasChildren = item.children && item.children.length > 0}
				{@const isExpanded = expandedSections.has(item.name)}

				<div>
					{#if hasChildren}
						<button
							onclick={() => toggleSection(item.name)}
							class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
							class:bg-gray-100={isActive}
							class:text-gray-900={isActive}
						>
							<div class="flex items-center gap-3">
								<item.icon class="size-4.5" />
								{item.name}
							</div>
							<ChevronDown
								class={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
							/>
						</button>
					{:else}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
							class:bg-gray-100={isActive}
							class:text-gray-900={isActive}
						>
							<item.icon class="size-4.5" />
							{item.name}
						</a>
					{/if}

					<!-- Child Items -->
					{#if hasChildren && isExpanded}
						<div class="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
							{#each item.children as child}
								{@const childActive = isChildActive(child.href)}
								<a
									href={child.href}
									class="block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
									class:bg-gray-100={childActive}
									class:font-medium={childActive}
									class:text-gray-900={childActive}
								>
									{child.name}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</nav>
	</div>
</aside>
