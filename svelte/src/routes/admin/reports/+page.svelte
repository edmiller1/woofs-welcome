<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Flag, Construction } from '@lucide/svelte';

	let activeTab = $state<string>('pending');
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-slate-900">Reports</h1>
		<p class="text-muted-foreground mt-1">Review and manage reported content</p>
	</div>

	<Tabs.Root bind:value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="pending">Pending</Tabs.Trigger>
			<Tabs.Trigger value="resolved">Resolved</Tabs.Trigger>
			<Tabs.Trigger value="rejected">Rejected</Tabs.Trigger>
			<Tabs.Trigger value="all">All</Tabs.Trigger>
		</Tabs.List>

		<div class="mt-6">
			<Card.Root>
				<Card.Content class="py-16 text-center">
					<div
						class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
					>
						<Construction class="h-8 w-8 text-slate-400" />
					</div>
					<h3 class="mt-4 text-lg font-medium text-slate-900">Coming Soon</h3>
					<p class="mt-2 max-w-sm mx-auto text-slate-500">
						The reports management feature is under development. You'll be able to review and
						moderate reported reviews here.
					</p>
					<div class="mt-6 rounded-lg bg-amber-50 p-4 max-w-md mx-auto">
						<p class="text-sm text-amber-800">
							<strong>Note:</strong> To enable this feature, you'll need to add admin endpoints for fetching
							and resolving review reports in the backend.
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</Tabs.Root>
</div>
