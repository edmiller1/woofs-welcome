<script lang="ts">
	import { page } from '$app/state';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getUserInitials } from '$lib/helpers';
	import type { BAUser } from '$lib/types/user';
	import {
		ChevronDown,
		FileText,
		Flag,
		LayoutDashboard,
		Settings,
		Shield,
		Users
	} from '@lucide/svelte';

	interface Props {
		user: BAUser;
	}

	interface NavItem {
		name: string;
		href: string;
		icon: any;
		badge?: number;
		children?: Array<{
			name: string;
			href: string;
		}>;
	}

	const { user }: Props = $props();

	const navItems: NavItem[] = [
		{
			name: 'Dashboard',
			href: '/admin',
			icon: LayoutDashboard
		},
		{
			name: 'Claims',
			href: '/admin/claims',
			icon: FileText
		},
		{
			name: 'Reports',
			href: '/admin/reports',
			icon: Flag
		},
		{
			name: 'Users',
			href: '/admin/users',
			icon: Users
		},
		{
			name: 'Settings',
			href: '/admin/settings',
			icon: Settings
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
		if (item.href === '/admin') {
			return page.url.pathname === '/admin';
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

<aside class="hidden h-full w-64 flex-shrink-0 overflow-y-auto border-r bg-slate-900 md:block">
	<div class="flex h-full flex-col p-6">
		<!-- Admin Header -->
		<div class="mb-10 flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600"
			>
				<Shield class="h-5 w-5 text-white" />
			</div>
			<div>
				<h3 class="text-sm font-bold text-white">Admin Portal</h3>
				<span class="text-xs text-slate-400">Woofs Welcome</span>
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
							class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
							class:bg-slate-800={isActive}
							class:text-white={isActive}
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
							class="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
							class:bg-slate-800={isActive}
							class:text-white={isActive}
						>
							<div class="flex items-center gap-3">
								<item.icon class="size-4.5" />
								{item.name}
							</div>
							{#if item.badge && item.badge > 0}
								<span
									class="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white"
								>
									{item.badge}
								</span>
							{/if}
						</a>
					{/if}

					<!-- Child Items -->
					{#if hasChildren && isExpanded}
						<div class="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-4">
							{#each item.children as child}
								{@const childActive = isChildActive(child.href)}
								<a
									href={child.href}
									class="block rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
									class:bg-slate-800={childActive}
									class:font-medium={childActive}
									class:text-white={childActive}
								>
									{child.name}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</nav>

		<!-- User Info -->
		<div class="mt-auto border-t border-slate-700 pt-4">
			<div class="flex items-center gap-3">
				<Avatar.Root class="h-9 w-9 border-2 border-slate-700">
					<Avatar.Image src={user.image?.responsive?.sm} alt={user.name} />
					<Avatar.Fallback class="bg-slate-700 text-white"
						>{getUserInitials(user.name)}</Avatar.Fallback
					>
				</Avatar.Root>
				<div class="flex-1 overflow-hidden">
					<p class="truncate text-sm font-medium text-white">{user.name}</p>
					<p class="truncate text-xs text-slate-400">{user.email}</p>
				</div>
			</div>
		</div>
	</div>
</aside>
