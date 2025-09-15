<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import DialogHeader from './ui/dialog/dialog-header.svelte';

	interface Props {
		open: boolean;
		confirmFunction: () => void;
	}

	let { open, confirmFunction }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<DialogHeader>Are you sure?</DialogHeader>
		<Dialog.Description>This action cannot be undone.</Dialog.Description>
		<div class="mt-4 flex gap-4">
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button variant="default" onclick={confirmFunction}>Confirm</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
