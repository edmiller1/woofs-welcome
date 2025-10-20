<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CircleAlert, RefreshCw } from '@lucide/svelte';
	import { getErrorMessage, isApiError } from '$lib/errors';

	interface Props {
		error?: Error | unknown;
		reset?: () => void;
		children?: import('svelte').Snippet;
	}

	let { error, reset, children }: Props = $props();

	const errorMessage = $derived(error ? getErrorMessage(error) : 'Something went wrong');

	const handleReset = () => {
		if (reset) {
			reset();
		} else {
			window.location.reload();
		}
	};

	const isDevelopment = import.meta.env.DEV;
</script>

{#if error}
	<div class="flex min-h-[400px] flex-col items-center justify-center p-8">
		<div class="mx-auto max-w-md text-center">
			<div class="mb-4 flex justify-center">
				<div class="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
					<CircleAlert class="h-8 w-8 text-red-600 dark:text-red-400" />
				</div>
			</div>

			<h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
				Oops! Something went wrong
			</h2>

			<p class="text-muted-foreground mb-6">
				{errorMessage}
			</p>

			{#if isApiError(error) && error.details}
				<div class="bg-muted mb-6 rounded-lg p-4 text-left">
					<p class="mb-2 text-sm font-semibold">Validation Errors:</p>
					<ul class="space-y-1 text-sm">
						{#each error.details as detail}
							<li class="text-red-600 dark:text-red-400">
								<strong>{detail.field}:</strong>
								{detail.message}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<Button onclick={handleReset} class="gap-2">
				<RefreshCw class="h-4 w-4" />
				Try Again
			</Button>

			{#if isDevelopment && error instanceof Error}
				<details class="mt-6 text-left">
					<summary class="text-muted-foreground cursor-pointer text-sm font-medium">
						Developer Info
					</summary>
					<pre class="bg-muted mt-2 overflow-auto rounded-lg p-4 text-xs">{error.stack}</pre>
				</details>
			{/if}
		</div>
	</div>
{:else if children}
	{@render children()}
{/if}
