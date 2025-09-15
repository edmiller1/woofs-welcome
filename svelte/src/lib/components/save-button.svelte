<script lang="ts">
	import { api } from '$lib/api';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Button } from './ui/button';
	import type { BAUser } from '$lib/types/models.js';
	import { Heart, Loader2 } from '@lucide/svelte';

	interface Props {
		user: BAUser | null;
		openAuthModal: () => void;
		placeId: string;
		isFavourited: boolean;
	}

	const { user, openAuthModal, placeId, isFavourited }: Props = $props();

	const queryClient = useQueryClient();

	const favouritePlace = createMutation({
		mutationFn: api.place.favouritePlace,
		onSuccess: (data) => {
			toast.success(`Place ${data.action === 'added' ? 'added to' : 'removed from'} favourites`);
			queryClient.invalidateQueries({
				queryKey: ['place']
			});
		},
		onError: (error) => {
			toast.error(`Operation failed: ${error.message}`);
		}
	});
</script>

{#if $favouritePlace.isPending}
	<Button variant="outline" size="sm" class="rounded-full" disabled>
		<Loader2 class="size-4 animate-spin" />
	</Button>
{:else}
	<Button
		variant="outline"
		size="sm"
		class="rounded-full"
		onclick={user ? () => $favouritePlace.mutate(placeId) : openAuthModal}
	>
		{#if isFavourited}
			Saved
		{:else}
			Save
		{/if}
		<Heart class={`size-3 ${isFavourited ? 'fill-rose-500 text-rose-500' : 'text-primary'}`} />
	</Button>
{/if}
