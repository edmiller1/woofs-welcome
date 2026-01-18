<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Construction, Settings } from '@lucide/svelte';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold text-slate-900">Settings</h1>
		<p class="text-muted-foreground mt-1">Configure admin settings</p>
	</div>

	<Card.Root>
		<Card.Content class="py-16 text-center">
			<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
				<Construction class="h-8 w-8 text-slate-400" />
			</div>
			<h3 class="mt-4 text-lg font-medium text-slate-900">Coming Soon</h3>
			<p class="mx-auto mt-2 max-w-sm text-slate-500">
				The admin settings feature is under development.
			</p>
		</Card.Content>
	</Card.Root>
</div>
