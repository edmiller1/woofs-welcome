<script lang="ts">
	import type { ClaimWithDetails, ClaimStatus } from '$lib/types/claim';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import type { PageData } from './$types';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import { LoaderCircle } from '@lucide/svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const user = data.user;

	const claims = createQuery({
		queryKey: ['business-dashboard-claims'],
		queryFn: () => api.claim.getBusinessClaims(user?.business.id!)
	});

	let selectedStatus = $state<ClaimStatus | 'all'>('all');

	const statusFilters: Array<{ label: string; value: ClaimStatus | 'all' }> = [
		{ label: 'All', value: 'all' },
		{ label: 'Pending', value: 'pending' },
		{ label: 'Approved', value: 'approved' },
		{ label: 'Rejected', value: 'rejected' }
	];

	const filteredClaims = $derived(
		selectedStatus === 'all'
			? $claims.data
			: $claims.data?.filter((claim) => claim.status === selectedStatus)
	);

	function getStatusBadgeVariant(status: ClaimStatus): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'approved':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'rejected':
				return 'destructive';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{user?.business.name ?? 'Woofs Welcome'} - Claims</title>
</svelte:head>

{#if $claims.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<LoaderCircle class="text-primary size-10 animate-spin" />
	</div>
{:else if $claims.isError}
	<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
		Failed to load place. Please try again.
	</div>
{:else if $claims.data && $claims.data.length > 0}
	<div class="max-w-full">
		<div class="mb-6">
			<h1 class="mb-2 text-2xl font-bold">Claims</h1>
			<p class="text-muted-foreground text-sm">
				Manage your business location claims and their verification status
			</p>
		</div>

		<Separator class="mb-6" />

		<!-- Status Filter Tabs -->
		<div class="mb-6 flex gap-3 overflow-x-auto pb-2">
			{#each statusFilters as filter}
				<button
					onclick={() => (selectedStatus = filter.value)}
					class="group relative cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 {selectedStatus ===
					filter.value
						? 'bg-foreground/5 text-foreground'
						: 'text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground'}"
				>
					<span class="relative z-10 flex items-center gap-2">
						{filter.label}
						<span
							class="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-colors {selectedStatus ===
							filter.value
								? 'bg-foreground/10 text-foreground'
								: 'bg-muted text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground'}"
						>
							{filter.value === 'all'
								? $claims.data.length
								: $claims.data.filter((c) => c.status === filter.value).length}
						</span>
					</span>
					{#if selectedStatus === filter.value}
						<div class="bg-foreground/5 absolute inset-0 rounded-lg"></div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Claims List -->
		{#if filteredClaims && filteredClaims.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">
						{selectedStatus === 'all'
							? 'No claims found. Start by claiming a location.'
							: `No ${selectedStatus} claims found.`}
					</p>
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4 md:grid-cols-2">
				{#each filteredClaims as claim (claim.id)}
					<Card class="pt-0 transition-shadow hover:shadow-md">
						<!-- Place Image -->
						{#if claim.place.images && claim.place.images.length > 0}
							<div class="relative h-48 w-full overflow-hidden rounded-t-lg">
								<picture>
									<source
										type="image/webp"
										srcset={claim.place.images[0].webp.srcset}
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
									/>
									<img
										src={claim.place.images[0].src}
										srcset={claim.place.images[0].srcset}
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
										alt={claim.place.images[0].altText || claim.place.name}
										class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
										loading="lazy"
									/>
								</picture>
								<div class="absolute right-3 top-3">
									<Badge variant={getStatusBadgeVariant(claim.status)}>
										{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
									</Badge>
								</div>
							</div>
						{:else}
							<div
								class="bg-muted relative flex h-48 w-full items-center justify-center rounded-t-lg"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="text-muted-foreground h-16 w-16"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<div class="absolute right-3 top-3">
									<Badge variant={getStatusBadgeVariant(claim.status)}>
										{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
									</Badge>
								</div>
							</div>
						{/if}

						<CardHeader>
							<CardTitle class="text-lg">{claim.place.name}</CardTitle>
							{#if claim.place.address}
								<p class="text-muted-foreground text-sm">{claim.place.address}</p>
							{/if}
						</CardHeader>
						<CardContent>
							<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<div>
									<p class="text-muted-foreground mb-1 text-xs font-medium">Role</p>
									<p class="text-sm">{claim.role}</p>
								</div>
								<div>
									<p class="text-muted-foreground mb-1 text-xs font-medium">Business Email</p>
									<p class="text-sm">{claim.businessEmail}</p>
								</div>
								<div>
									<p class="text-muted-foreground mb-1 text-xs font-medium">Business Phone</p>
									<p class="text-sm">{claim.businessPhone}</p>
								</div>
								<div>
									<p class="text-muted-foreground mb-1 text-xs font-medium">Claimed On</p>
									<p class="text-sm">{formatDate(claim.claimedAt)}</p>
								</div>
								{#if claim.approvedAt}
									<div>
										<p class="text-muted-foreground mb-1 text-xs font-medium">Approved On</p>
										<p class="text-sm">{formatDate(claim.approvedAt)}</p>
									</div>
								{/if}
								{#if claim.reviewedAt}
									<div>
										<p class="text-muted-foreground mb-1 text-xs font-medium">Reviewed On</p>
										<p class="text-sm">{formatDate(claim.reviewedAt)}</p>
									</div>
								{/if}
							</div>

							{#if claim.additionalNotes}
								<div class="mt-4">
									<p class="text-muted-foreground mb-1 text-xs font-medium">Additional Notes</p>
									<p class="text-sm">{claim.additionalNotes}</p>
								</div>
							{/if}

							{#if claim.rejectionReason}
								<div class="border-destructive/20 bg-destructive/5 mt-4 rounded-md border p-3">
									<p class="text-destructive mb-1 text-xs font-medium">Rejection Reason</p>
									<p class="text-destructive text-sm">{claim.rejectionReason}</p>
								</div>
							{/if}

							{#if claim.verificationDocuments && claim.verificationDocuments.length > 0}
								<div class="mt-4">
									<p class="text-muted-foreground mb-2 text-xs font-medium">
										Verification Documents ({claim.verificationDocuments.length})
									</p>
									<div class="flex flex-wrap gap-2">
										{#each claim.verificationDocuments as doc}
											<a
												href={doc}
												target="_blank"
												rel="noopener noreferrer"
												class="hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs transition-colors"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													class="h-3 w-3"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												Document
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
{:else if $claims.data && $claims.data.length === 0}
	<div class="flex items-center justify-center">
		<div class="flex flex-col items-center justify-center gap-3">
			<p class="text-muted-foreground">You have no claimed businesses.</p>
			<a href="/explore" class="btn btn-primary">Explore places to claim</a>
		</div>
	</div>
{/if}
