<script lang="ts">
	import { auth } from '$lib/auth/stores';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { cn } from '$lib/utils';
	import { CircleUser, Cog, LogOut, Users } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSub,
		DropdownMenuSubContent,
		DropdownMenuSubTrigger,
		DropdownMenuTrigger
	} from './ui/dropdown-menu';
	import type { BAUser } from '$lib/types/user';
	import { getUserInitials } from '$lib/helpers';
	import type { Context, ErrorResponse } from '$lib/types/types';
	import { api } from '$lib/api';
	import { toast } from 'svelte-sonner';
	import { createMutation } from '@tanstack/svelte-query';
	import type { AxiosError } from 'axios';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const { user, className }: { user: BAUser; className?: string } = $props();

	const switchContext = createMutation({
		mutationFn: async (context: Context) => api.auth.switchContext(context),
		onSuccess: () => {
			toast.success('Switched to account ' + user.business.name);
			if (page.url.pathname.startsWith('/profile')) {
				goto('/business/dashboard');
			} else {
				window.location.reload();
			}
		},
		onError: (error: AxiosError<ErrorResponse>) => {
			if (error.response?.data.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Failed to switch to business account. Please try again.');
			}
		}
	});
</script>

<DropdownMenu>
	<DropdownMenuTrigger class={cn('cursor-pointer', className)}>
		<Avatar class="ml-auto">
			<AvatarImage
				src={user.image?.responsive.xs}
				alt={user.name}
				referrerpolicy="no-referrer"
				class="object-cover object-center"
			/>
			<AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
		</Avatar>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end" class="mt-2">
		<a href="/profile">
			<DropdownMenuItem><CircleUser class="text-foreground" /> Profile</DropdownMenuItem>
		</a>
		<a href="/profile/settings">
			<DropdownMenuItem><Cog class="text-foreground" />Settings</DropdownMenuItem>
		</a>
		{#if user.isBusinessAccount && user.business}
			<DropdownMenuSub>
				<DropdownMenuSubTrigger
					><Users class="text-foreground" />Switch Account</DropdownMenuSubTrigger
				>
				<DropdownMenuSubContent>
					<DropdownMenuItem class="flex items-start justify-between">
						<div class="flex items-center">
							<Avatar>
								<AvatarImage
									src={user.image?.responsive.xs}
									alt={user.name}
									class="object-cover object-center"
								/>
								<AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
							</Avatar>
							<div class="ml-2 flex flex-col">
								<span>{user.name}</span>
								<span class="text-muted-foreground text-xs">{user.email}</span>
							</div>
						</div>
						{#if user.activeContext === 'personal'}
							<div class="bg-secondary mt-1 size-2 rounded-full"></div>
						{:else}
							<div class="mt-1 size-2 rounded-full border border-gray-900"></div>
						{/if}
					</DropdownMenuItem>
					<DropdownMenuItem
						class="flex items-start justify-between"
						onclick={() => $switchContext.mutate('business')}
					>
						<div class="flex items-center">
							<Avatar>
								<AvatarImage
									src={user.business.logoUrl?.responsive.xs}
									alt={user.business.name}
									class="object-cover object-center"
								/>
								<AvatarFallback>{getUserInitials(user.business.name)}</AvatarFallback>
							</Avatar>
							<div class="ml-2 flex flex-col">
								<span>{user.business.name}</span>
								<span class="text-muted-foreground text-xs">{user.business.email}</span>
							</div>
						</div>
						{#if user.activeContext === 'business'}
							<div class="bg-secondary mt-1 size-2 rounded-full"></div>
						{:else}
							<div class="mt-1 size-2 rounded-full border border-gray-900"></div>
						{/if}
					</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>
		{/if}
		<DropdownMenuItem onclick={() => auth.signOut()}
			><LogOut class="text-foreground" />Sign out</DropdownMenuItem
		>
	</DropdownMenuContent>
</DropdownMenu>
