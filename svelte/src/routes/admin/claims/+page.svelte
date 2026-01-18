<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		Check,
		X,
		FileText,
		LoaderCircle,
		ExternalLink,
		Building2,
		Mail,
		Phone,
		User,
		Calendar,
		MapPin
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { ClaimStatus, ClaimWithDetails } from '$lib/types/claim';

	const queryClient = useQueryClient();

	let activeTab = $state<ClaimStatus | 'all'>('pending');
	let selectedClaim = $state<ClaimWithDetails | null>(null);
	let showRejectDialog = $state(false);
	let rejectionReason = $state('');

	// Fetch claims based on active tab
	const claimsQuery = createQuery({
		queryKey: ['admin-claims', activeTab],
		queryFn: () =>
			activeTab === 'all'
				? api.admin.getAdminClaims()
				: activeTab === 'pending'
					? api.admin.getAdminPendingClaims().then((r) => r.data)
					: api.admin.getAdminClaims(activeTab)
	});

	// Approve mutation
	const approveMutation = createMutation({
		mutationFn: (claimId: string) => api.admin.approveClaim(claimId),
		onSuccess: () => {
			toast.success('Claim approved successfully');
			queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
			queryClient.invalidateQueries({ queryKey: ['admin-pending-claims'] });
			selectedClaim = null;
		},
		onError: (error) => {
			toast.error(`Failed to approve claim: ${error.message}`);
		}
	});

	// Reject mutation
	const rejectMutation = createMutation({
		mutationFn: ({ claimId, reason }: { claimId: string; reason: string }) =>
			api.admin.rejectClaim(claimId, reason),
		onSuccess: () => {
			toast.success('Claim rejected');
			queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
			queryClient.invalidateQueries({ queryKey: ['admin-pending-claims'] });
			selectedClaim = null;
			showRejectDialog = false;
			rejectionReason = '';
		},
		onError: (error) => {
			toast.error(`Failed to reject claim: ${error.message}`);
		}
	});

	function handleApprove(claim: ClaimWithDetails) {
		$approveMutation.mutate(claim.id);
	}

	function handleRejectClick(claim: ClaimWithDetails) {
		selectedClaim = claim;
		showRejectDialog = true;
	}

	function handleRejectConfirm() {
		if (!selectedClaim || !rejectionReason.trim()) return;
		$rejectMutation.mutate({ claimId: selectedClaim.id, reason: rejectionReason });
	}

	function getStatusBadge(status: ClaimStatus) {
		switch (status) {
			case 'pending':
				return { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
			case 'approved':
				return { class: 'bg-green-100 text-green-800', label: 'Approved' };
			case 'rejected':
				return { class: 'bg-red-100 text-red-800', label: 'Rejected' };
			default:
				return { class: 'bg-gray-100 text-gray-800', label: status };
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-NZ', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-slate-900">Claims</h1>
		<p class="text-muted-foreground mt-1">Review and manage business claims for places</p>
	</div>

	<Tabs.Root bind:value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="pending">Pending</Tabs.Trigger>
			<Tabs.Trigger value="approved">Approved</Tabs.Trigger>
			<Tabs.Trigger value="rejected">Rejected</Tabs.Trigger>
			<Tabs.Trigger value="all">All</Tabs.Trigger>
		</Tabs.List>

		<div class="mt-6">
			{#if $claimsQuery.isPending}
				<div class="flex items-center justify-center py-12">
					<LoaderCircle class="h-8 w-8 animate-spin text-slate-400" />
				</div>
			{:else if $claimsQuery.error}
				<Card.Root>
					<Card.Content class="py-12 text-center">
						<p class="text-red-500">Error loading claims: {$claimsQuery.error.message}</p>
					</Card.Content>
				</Card.Root>
			{:else if !$claimsQuery.data || $claimsQuery.data.length === 0}
				<Card.Root>
					<Card.Content class="py-12 text-center">
						<FileText class="mx-auto h-12 w-12 text-slate-300" />
						<p class="mt-2 text-slate-500">No {activeTab === 'all' ? '' : activeTab} claims found</p>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="space-y-4">
					{#each $claimsQuery.data as claim (claim.id)}
						{@const statusBadge = getStatusBadge(claim.status)}
						<Card.Root class="overflow-hidden">
							<div class="flex flex-col lg:flex-row">
								<!-- Place Image -->
								<div class="h-48 w-full flex-shrink-0 bg-slate-100 lg:h-auto lg:w-48">
									{#if claim.place.images && claim.place.images[0]}
										<img
											src={claim.place.images[0].responsive?.sm || claim.place.images[0].url}
											alt={claim.place.name}
											class="h-full w-full object-cover"
										/>
									{:else}
										<div class="flex h-full items-center justify-center">
											<MapPin class="h-12 w-12 text-slate-300" />
										</div>
									{/if}
								</div>

								<!-- Content -->
								<div class="flex flex-1 flex-col p-6">
									<div class="flex items-start justify-between gap-4">
										<div>
											<div class="flex items-center gap-2">
												<h3 class="text-lg font-semibold text-slate-900">
													{claim.place.name}
												</h3>
												<Badge class={statusBadge.class}>{statusBadge.label}</Badge>
											</div>
											{#if claim.place.address}
												<p class="mt-1 text-sm text-slate-500">{claim.place.address}</p>
											{/if}
										</div>
										<a
											href={`/place/${claim.place.slug}`}
											target="_blank"
											class="text-slate-400 hover:text-slate-600"
										>
											<ExternalLink class="h-5 w-5" />
										</a>
									</div>

									<!-- Claim Details -->
									<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
										<div class="flex items-center gap-2 text-sm">
											<Building2 class="h-4 w-4 text-slate-400" />
											<span class="text-slate-600">{claim.business.name}</span>
										</div>
										<div class="flex items-center gap-2 text-sm">
											<Mail class="h-4 w-4 text-slate-400" />
											<span class="text-slate-600">{claim.businessEmail}</span>
										</div>
										<div class="flex items-center gap-2 text-sm">
											<Phone class="h-4 w-4 text-slate-400" />
											<span class="text-slate-600">{claim.businessPhone}</span>
										</div>
										<div class="flex items-center gap-2 text-sm">
											<User class="h-4 w-4 text-slate-400" />
											<span class="text-slate-600">{claim.role}</span>
										</div>
									</div>

									{#if claim.additionalNotes}
										<div class="mt-4 rounded-lg bg-slate-50 p-3">
											<p class="text-sm text-slate-600">{claim.additionalNotes}</p>
										</div>
									{/if}

									<!-- Documents -->
									{#if claim.verificationDocuments && claim.verificationDocuments.length > 0}
										<div class="mt-4">
											<p class="mb-2 text-sm font-medium text-slate-700">
												Verification Documents ({claim.verificationDocuments.length})
											</p>
											<div class="flex flex-wrap gap-2">
												{#each claim.verificationDocuments as doc, i}
													<a
														href={doc}
														target="_blank"
														class="inline-flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
													>
														<FileText class="h-4 w-4" />
														Document {i + 1}
														<ExternalLink class="h-3 w-3" />
													</a>
												{/each}
											</div>
										</div>
									{/if}

									<!-- Footer -->
									<div class="mt-4 flex items-center justify-between border-t pt-4">
										<div class="flex items-center gap-2 text-sm text-slate-500">
											<Calendar class="h-4 w-4" />
											Submitted {formatDate(claim.createdAt)}
										</div>

										{#if claim.status === 'pending'}
											<div class="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onclick={() => handleRejectClick(claim)}
													disabled={$rejectMutation.isPending}
												>
													<X class="mr-1.5 h-4 w-4" />
													Reject
												</Button>
												<Button
													size="sm"
													onclick={() => handleApprove(claim)}
													disabled={$approveMutation.isPending}
												>
													{#if $approveMutation.isPending}
														<LoaderCircle class="mr-1.5 h-4 w-4 animate-spin" />
													{:else}
														<Check class="mr-1.5 h-4 w-4" />
													{/if}
													Approve
												</Button>
											</div>
										{:else if claim.status === 'rejected' && claim.rejectionReason}
											<div class="max-w-md rounded-lg bg-red-50 p-2 text-sm text-red-700">
												<span class="font-medium">Rejection reason:</span>
												{claim.rejectionReason}
											</div>
										{/if}
									</div>
								</div>
							</div>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
	</Tabs.Root>
</div>

<!-- Reject Dialog -->
<Dialog.Root bind:open={showRejectDialog}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Reject Claim</Dialog.Title>
			<Dialog.Description>
				Please provide a reason for rejecting this claim. This will be sent to the business owner.
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<Textarea
				bind:value={rejectionReason}
				placeholder="Enter rejection reason..."
				rows={4}
				class="resize-none"
			/>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showRejectDialog = false)}>Cancel</Button>
			<Button
				variant="destructive"
				onclick={handleRejectConfirm}
				disabled={!rejectionReason.trim() || $rejectMutation.isPending}
			>
				{#if $rejectMutation.isPending}
					<LoaderCircle class="mr-1.5 h-4 w-4 animate-spin" />
				{/if}
				Reject Claim
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
