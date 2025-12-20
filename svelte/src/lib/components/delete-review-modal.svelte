<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { LoaderCircle, Trash2 } from '@lucide/svelte';
	import { Button } from './ui/button';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import { toast } from 'svelte-sonner';

	interface Props {
		reviewId: string;
		placeSlug: string;
		open: boolean;
		openModal: () => void;
	}

	let { reviewId, placeSlug, open, openModal }: Props = $props();

	const queryClient = useQueryClient();

	const deleteReview = createMutation({
		mutationFn: () => api.review.deleteReview(placeSlug, reviewId),
		onSuccess: () => {
			toast.success('Review deleted successfully!');
			queryClient.invalidateQueries({ queryKey: ['reviews', placeSlug] });
			queryClient.invalidateQueries({ queryKey: ['profile-reviews'] });
			openModal();
		},
		onError: (error) => {
			console.log(error);
			toast.error('Failed to delete review');
		}
	});
</script>

<Dialog.Root bind:open onOpenChange={openModal}>
	<Dialog.Trigger>
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="outline" size="icon" onclick={openModal}>
						<Trash2 class="size-4" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Delete review</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</Dialog.Trigger>
	<Dialog.Content
		onInteractOutside={(e) => {
			e.preventDefault();
		}}
		class="sm:max-w-[425px]"
		showCloseButton={false}
	>
		<Dialog.Header>
			<Dialog.Title>Delete review</Dialog.Title>
			<Dialog.Description
				>This will delete the review and all associated images. This action is permanent and cannot
				be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="outline" disabled={$deleteReview.isPending}>Cancel</Button>
				<Button
					variant="destructive"
					disabled={$deleteReview.isPending}
					onclick={() => $deleteReview.mutate()}
				>
					{#if $deleteReview.isPending}
						<LoaderCircle class="mr-2 size-4 animate-spin" />
						Deleting review...
					{:else}
						Delete review
					{/if}
				</Button>
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
