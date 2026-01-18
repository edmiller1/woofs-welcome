<script lang="ts">
	import { api } from '$lib/api';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select/index.js';
	import { toast } from 'svelte-sonner';
	import type { ClaimRole, ClaimWithDetails } from '$lib/types/claim';
	import type { ErrorResponse } from '$lib/types/types';
	import type { AxiosError } from 'axios';
	import { getFileBase64 } from '$lib/helpers';
	import { FileText, LoaderCircle, Paperclip, Upload, X } from '@lucide/svelte';

	interface Props {
		claim: ClaimWithDetails;
		open: boolean;
		onClose: () => void;
	}

	let { claim, open = $bindable(), onClose }: Props = $props();

	const queryClient = useQueryClient();

	const roleOptions: ClaimRole[] = ['Owner', 'Manager', 'Marketing Manager', 'Staff', 'Other'];

	let formData = $state({
		role: claim.role,
		additionalNotes: claim.additionalNotes || '',
		existingDocuments: [...(claim.verificationDocuments || [])],
		documentsToRemove: [] as string[],
		newDocuments: [] as { id: string; file: File; base64: string; name: string }[]
	});

	let selectedRole = $state<ClaimRole>(claim.role);

	console.log(claim);

	let isUploading = $state(false);

	const updateClaim = createMutation({
		mutationFn: async (data: {
			role?: 'Owner' | 'Manager' | 'Marketing Manager' | 'Staff' | 'Other';
			additionalNotes?: string;
			documentsToRemove?: string[];
			documentsToAdd?: Array<{ data: string; fileName: string }>;
		}) => api.claim.updateClaim(claim.id, data),
		onSuccess: () => {
			toast.success('Claim updated successfully!');
			queryClient.invalidateQueries({ queryKey: ['business-dashboard-claims'] });
			onClose();
		},
		onError: (error: AxiosError<ErrorResponse>) => {
			const message = error.message || 'Failed to update claim';
			toast.error(message);
		}
	});

	async function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		isUploading = true;

		try {
			const files = Array.from(input.files);

			// Validate total documents count
			const totalDocs =
				formData.existingDocuments.length -
				formData.documentsToRemove.length +
				formData.newDocuments.length +
				files.length;

			if (totalDocs > 10) {
				toast.error('Maximum 10 documents allowed');
				isUploading = false;
				return;
			}

			for (const file of files) {
				// Validate file size (10MB)
				if (file.size > 10 * 1024 * 1024) {
					toast.error(`${file.name} is too large. Maximum size is 10MB`);
					continue;
				}

				const base64 = await getFileBase64(file);

				formData.newDocuments.push({
					id: crypto.randomUUID(),
					file,
					base64,
					name: file.name
				});
			}

			formData.newDocuments = [...formData.newDocuments];
		} catch (error) {
			console.error('Failed to process files:', error);
			toast.error('Failed to process files');
		} finally {
			isUploading = false;
			input.value = '';
		}
	}

	function removeNewDocument(id: string) {
		formData.newDocuments = formData.newDocuments.filter((doc) => doc.id !== id);
	}

	function removeExistingDocument(url: string) {
		if (!formData.documentsToRemove.includes(url)) {
			formData.documentsToRemove.push(url);
			formData.documentsToRemove = [...formData.documentsToRemove];
		}
	}

	function restoreExistingDocument(url: string) {
		formData.documentsToRemove = formData.documentsToRemove.filter((doc) => doc !== url);
	}

	function handleSubmit() {
		// Validate at least one document will remain
		const remainingDocs =
			formData.existingDocuments.length -
			formData.documentsToRemove.length +
			formData.newDocuments.length;

		if (remainingDocs === 0) {
			toast.error('At least one verification document is required');
			return;
		}

		const updateData: {
			role?: 'Owner' | 'Manager' | 'Marketing Manager' | 'Staff' | 'Other';
			additionalNotes?: string;
			documentsToRemove?: string[];
			documentsToAdd?: Array<{ data: string; fileName: string }>;
		} = {};

		// Only include changed fields
		if (selectedRole !== claim.role) {
			updateData.role = selectedRole;
		}

		if (formData.additionalNotes !== (claim.additionalNotes || '')) {
			updateData.additionalNotes = formData.additionalNotes;
		}

		if (formData.documentsToRemove.length > 0) {
			updateData.documentsToRemove = formData.documentsToRemove;
		}

		if (formData.newDocuments.length > 0) {
			updateData.documentsToAdd = formData.newDocuments.map((doc) => ({
				data: doc.base64,
				fileName: doc.name
			}));
		}

		// Check if anything changed
		if (Object.keys(updateData).length === 0) {
			toast.info('No changes to save');
			return;
		}

		$updateClaim.mutate(updateData);
	}

	const roleContent = $derived(roleOptions.find((r) => r === selectedRole) ?? 'Select a role');
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Edit Claim</Dialog.Title>
			<Dialog.Description>
				Update your claim details for {claim.place.name}. Changes will be reviewed by our team.
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="space-y-6 py-4"
		>
			<!-- Role Selection -->
			<div class="space-y-2">
				<Label for="role">Your Role *</Label>
				<Select.Root type="single" bind:value={selectedRole}>
					<Select.Trigger class="w-full">
						{roleContent}
					</Select.Trigger>
					<Select.Content>
						{#each roleOptions as role}
							<Select.Item value={role} label={role}>
								{role}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Additional Notes -->
			<div class="space-y-2">
				<Label for="notes">Additional Notes</Label>
				<Textarea
					id="notes"
					bind:value={formData.additionalNotes}
					placeholder="Add any additional information about your claim..."
					rows={4}
					class="resize-none"
				/>
				<p class="text-muted-foreground text-xs">
					Provide any additional context that might help verify your claim
				</p>
			</div>

			<!-- Verification Documents -->
			<div class="space-y-3">
				<Label>Verification Documents *</Label>
				<p class="text-muted-foreground text-sm">
					Upload documents that prove your relationship to the business (business license, utility
					bill, etc.)
				</p>

				<!-- Existing Documents -->
				{#if formData.existingDocuments.length > 0}
					<div class="space-y-2">
						<p class="text-sm font-medium">Current Documents</p>
						{#each formData.existingDocuments as doc}
							{@const isMarkedForRemoval = formData.documentsToRemove.includes(doc)}
							<div
								class="bg-muted/50 flex items-center justify-between rounded-lg border p-3 {isMarkedForRemoval
									? 'opacity-50'
									: ''}"
							>
								<div class="flex items-center gap-3">
									<FileText class="text-muted-foreground h-5 w-5" />
									<div class="flex-1">
										<p class="flex items-center text-sm font-medium">
											<Paperclip class="mr-1.5 size-3" /> Document
										</p>
										<a
											href={doc}
											target="_blank"
											rel="noopener noreferrer"
											class="text-primary text-xs hover:underline"
										>
											View document
										</a>
									</div>
								</div>
								{#if isMarkedForRemoval}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => restoreExistingDocument(doc)}
									>
										Restore
									</Button>
								{:else}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => removeExistingDocument(doc)}
									>
										<X class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- New Documents -->
				{#if formData.newDocuments.length > 0}
					<div class="space-y-2">
						<p class="text-sm font-medium">New Documents</p>
						{#each formData.newDocuments as doc}
							<div class="bg-primary/5 flex items-center justify-between rounded-lg border p-3">
								<div class="flex items-center gap-3">
									<FileText class="text-primary h-5 w-5" />
									<div class="flex-1">
										<p class="ityems-center flex text-sm font-medium">
											<Paperclip class="mr-1.5 size-3" />
											{doc.name}
										</p>
										<p class="text-muted-foreground text-xs">
											{(doc.file.size / 1024).toFixed(1)} KB
										</p>
									</div>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={() => removeNewDocument(doc.id)}
								>
									<X class="h-4 w-4" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Upload Button -->
				<div class="flex items-center gap-2">
					<input
						type="file"
						id="documents"
						accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
						multiple
						class="hidden"
						onchange={handleFileSelect}
						disabled={isUploading ||
							formData.existingDocuments.length -
								formData.documentsToRemove.length +
								formData.newDocuments.length >=
								10}
					/>
					<Button
						type="button"
						variant="outline"
						onclick={() => document.getElementById('documents')?.click()}
						disabled={isUploading ||
							formData.existingDocuments.length -
								formData.documentsToRemove.length +
								formData.newDocuments.length >=
								10}
					>
						{#if isUploading}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							Processing...
						{:else}
							<Upload class="mr-2 h-4 w-4" />
							Add Documents
						{/if}
					</Button>
					<p class="text-muted-foreground text-xs">
						{formData.existingDocuments.length -
							formData.documentsToRemove.length +
							formData.newDocuments.length}/10 documents
					</p>
				</div>

				{#if formData.existingDocuments.length - formData.documentsToRemove.length + formData.newDocuments.length === 0}
					<p class="text-destructive text-sm">At least one document is required</p>
				{/if}
			</div>

			<!-- Actions -->
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={onClose} disabled={$updateClaim.isPending}>
					Cancel
				</Button>
				<Button type="submit" disabled={$updateClaim.isPending}>
					{#if $updateClaim.isPending}
						<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						Updating...
					{:else}
						Save Changes
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
