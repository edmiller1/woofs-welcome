<script lang="ts">
	import { getCurrentDayStatus, orderHoursByDay } from '$lib/helpers';
	import type { Hours } from '$lib/types/models';

	interface Props {
		hours: Hours | null;
	}

	const { hours }: Props = $props();
</script>

{#if hours}
	<div class="rounded-xl border p-2 shadow">
		<h4 class="text-lg font-semibold">Hours</h4>
		{#if getCurrentDayStatus(hours)}
			{@const status = getCurrentDayStatus(hours)}
			<div class="flex items-center gap-2">
				{#if status?.includes('Open till')}
					<span class="relative flex size-2">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75"
						></span>
						<span class="relative inline-flex size-2 rounded-full bg-green-500"></span>
					</span>
				{/if}
				<span
					class="text-sm font-semibold {status?.includes('Open till')
						? 'text-green-600'
						: status?.includes('Closed')
							? 'text-red-800'
							: 'text-orange-600'}"
				>
					{status}
				</span>
			</div>
		{/if}
		<div class="mt-2 space-y-1">
			{#each orderHoursByDay(hours) as day}
				{@const isToday = day.day === new Date().toLocaleDateString('en-AU', { weekday: 'long' })}
				<div
					class="flex items-center justify-between rounded px-4 py-2 {isToday
						? 'border-primary/20 bg-primary/10 border'
						: 'hover:bg-muted'}"
				>
					<span class="font-medium {isToday ? 'text-primary' : 'text-foreground'}">{day.day}</span>
					<span class={isToday ? 'text-primary font-medium' : 'text-muted-foreground'}
						>{day.hours}</span
					>
				</div>
			{/each}
		</div>
	</div>
{/if}
