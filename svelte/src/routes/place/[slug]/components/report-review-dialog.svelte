<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils';
	import { Flag, LoaderCircle } from '@lucide/svelte';
	import { Label } from '$lib/components/ui/label';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';

	const reasons = [
		{
			label: 'It contains sexually explicit or suggestive content',
			value: 'sexuallyExplicit'
		},
		{
			label: 'It contains hate speech',
			value: 'hateSpeech'
		},
		{
			label: 'It contains violence or threats',
			value: 'violence'
		},
		{
			label: 'It contains false or misleading information',
			value: 'falseInformation'
		},
		{
			label: 'It does not describe a personal experience',
			value: 'notPersonal'
		},
		{
			label: "it's a review of the wrong place",
			value: 'wrongPlace'
		}
	];

	interface Props {
		handleReportReview: (reportData: { reason: string; details: string }) => void;
		hasReported: boolean;
		openReportDialog: (hasReported: boolean) => void;
		reportLoading: boolean;
		open: boolean;
	}

	const { handleReportReview, hasReported, openReportDialog, reportLoading, open }: Props =
		$props();

	const formData = $state({
		reason: '',
		details: ''
	});
</script>

<Dialog.Root {open} onOpenChange={openReportDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2"><Flag /> Report Review</Dialog.Title>
		</Dialog.Header>
		<RadioGroup.Root bind:value={formData.reason}>
			{#each reasons as reason}
				<div class="my-1 flex items-center gap-2">
					<RadioGroup.Item value={reason.value} id={reason.value} />
					<Label for={reason.value} class=" font-medium">{reason.label}</Label>
				</div>
			{/each}
		</RadioGroup.Root>
		<Textarea
			placeholder="Provide more details about the review (optional)"
			bind:value={formData.details}
		/>
		<DialogFooter>
			<Button
				disabled={!formData.reason || reportLoading}
				onclick={() => handleReportReview(formData)}
			>
				{#if reportLoading}
					<LoaderCircle class="mr-2 size-4 animate-spin" /> Submitting...
				{:else}
					Submit Report
				{/if}
			</Button>
		</DialogFooter>
	</Dialog.Content>
</Dialog.Root>
