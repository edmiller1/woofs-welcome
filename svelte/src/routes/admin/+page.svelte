<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FileText, Flag, MapPin, MessageSquare, Users, LoaderCircle } from '@lucide/svelte';
	import type { BAUser } from '$lib/types/user';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	let { data }: Props = $props();

	// Fetch pending claims
	const pendingClaimsQuery = createQuery({
		queryKey: ['admin-pending-claims'],
		queryFn: api.admin.getAdminPendingClaims
	});

	// Placeholder stats (you can create a real endpoint later)
	const stats = $derived([
		{
			name: 'Pending Claims',
			value: $pendingClaimsQuery.data?.data?.length ?? 0,
			icon: FileText,
			href: '/admin/claims',
			color: 'bg-blue-500'
		},
		{
			name: 'Pending Reports',
			value: 0,
			icon: Flag,
			href: '/admin/reports',
			color: 'bg-red-500'
		},
		{
			name: 'Total Users',
			value: '-',
			icon: Users,
			href: '/admin/users',
			color: 'bg-green-500'
		},
		{
			name: 'Total Places',
			value: '-',
			icon: MapPin,
			href: '#',
			color: 'bg-purple-500'
		}
	]);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
		<p class="text-muted-foreground mt-1">Welcome back, {data.user.name}</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat}
			<a href={stat.href} class="group">
				<Card.Root
					class="transition-shadow hover:shadow-md group-hover:border-slate-300"
				>
					<Card.Content class="p-6">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-slate-500">{stat.name}</p>
								<p class="mt-1 text-3xl font-bold text-slate-900">
									{#if $pendingClaimsQuery.isPending && stat.name === 'Pending Claims'}
										<LoaderCircle class="h-8 w-8 animate-spin text-slate-400" />
									{:else}
										{stat.value}
									{/if}
								</p>
							</div>
							<div class={`rounded-lg p-3 ${stat.color}`}>
								<stat.icon class="h-6 w-6 text-white" />
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Recent Pending Claims -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<FileText class="h-5 w-5" />
					Recent Pending Claims
				</Card.Title>
				<Card.Description>Claims awaiting your review</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if $pendingClaimsQuery.isPending}
					<div class="flex items-center justify-center py-8">
						<LoaderCircle class="h-8 w-8 animate-spin text-slate-400" />
					</div>
				{:else if $pendingClaimsQuery.data?.data?.length === 0}
					<div class="py-8 text-center text-slate-500">
						<FileText class="mx-auto h-12 w-12 text-slate-300" />
						<p class="mt-2">No pending claims</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each ($pendingClaimsQuery.data?.data ?? []).slice(0, 5) as claim}
							<a
								href="/admin/claims"
								class="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50"
							>
								<div>
									<p class="font-medium text-slate-900">{claim.place.name}</p>
									<p class="text-sm text-slate-500">by {claim.business.name}</p>
								</div>
								<span
									class="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800"
								>
									Pending
								</span>
							</a>
						{/each}
					</div>
					{#if ($pendingClaimsQuery.data?.data?.length ?? 0) > 5}
						<a
							href="/admin/claims"
							class="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
						>
							View all {$pendingClaimsQuery.data?.data?.length} claims
						</a>
					{/if}
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Recent Reports -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Flag class="h-5 w-5" />
					Recent Reports
				</Card.Title>
				<Card.Description>Reported content needing attention</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="py-8 text-center text-slate-500">
					<Flag class="mx-auto h-12 w-12 text-slate-300" />
					<p class="mt-2">No pending reports</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
