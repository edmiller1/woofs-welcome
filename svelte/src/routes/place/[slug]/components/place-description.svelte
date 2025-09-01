<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { BAUser, Claim } from '$lib/types/models';
	import { BadgeCheck } from '@lucide/svelte';

	interface Props {
		description: string | null;
		claim: Claim | null;
		user: BAUser | null;
		openAuthModal: () => void;
	}

	const { description, claim, user, openAuthModal }: Props = $props();
</script>

<div class="py-4">
	<h4 class="text-xl font-semibold">Description</h4>
	{#if description}
		<p class="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">
			{description}
		</p>
	{:else if !claim}
		<div class="mt-4 rounded-lg border border-dashed border-gray-300 p-6 dark:border-gray-600">
			<div class="text-center">
				<BadgeCheck class="mx-auto h-12 w-12 text-gray-400" />
				<h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
					No description yet
				</h3>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Own or manage this business? Add a description to help visitors learn more.
				</p>
				<div class="mt-6">
					<Button
						onclick={user ? () => console.log('Claiming place') : openAuthModal}
						class="rounded-full"
					>
						<BadgeCheck class="h-4 w-4" />
						Claim this business
					</Button>
				</div>
			</div>
		</div>
	{:else}
		<p class="mt-2 italic text-gray-500 dark:text-gray-400">Description coming soon...</p>
	{/if}
</div>
