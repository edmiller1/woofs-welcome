<script lang="ts">
	import {
		Car,
		ChevronRight,
		Coffee,
		Home,
		MapPin,
		Scissors,
		ShoppingBag,
		SlidersHorizontal,
		Stethoscope,
		Trees,
		UtensilsCrossed,
		Waves
	} from '@lucide/svelte';
	import Button from './ui/button/button.svelte';

	const placeTypes = [
		{ name: 'Accommodation', icon: Home, href: '/explore/accommodation' },
		{ name: 'Things to Do', icon: MapPin, href: '/explore/activities' },
		{ name: 'Parks', icon: Trees, href: '/explore/parks' },
		{ name: 'Beaches', icon: Waves, href: '/explore/beaches' },
		{ name: 'Stores', icon: ShoppingBag, href: '/explore/stores' },
		{ name: 'Dining', icon: UtensilsCrossed, href: '/explore/dining' },
		{ name: 'Services', icon: Car, href: '/explore/services' },
		{ name: 'Veterinary', icon: Stethoscope, href: '/explore/veterinary' },
		{ name: 'Grooming', icon: Scissors, href: '/explore/grooming' },
		{ name: 'Cafes', icon: Coffee, href: '/explore/cafes' }
	];

	let activeType = $state<string | null>(null);
</script>

<div class="bg-background w-full">
	<div class="bg-background flex w-full shrink-0 items-center justify-center py-2">
		<div class="scrollbar-hide flex gap-8 overflow-x-auto">
			{#each placeTypes as placeType}
				<a
					href={placeType.href}
					class={`group relative flex min-w-fit flex-col items-center gap-2 rounded-lg px-2 transition-all duration-200 ${
						activeType === placeType.name ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
					}`}
					onclick={() => (activeType = placeType.name)}
				>
					<div class="flex flex-col items-center gap-2 py-2">
						<placeType.icon
							class={`h-6 w-6 transition-colors ${
								activeType === placeType.name
									? 'text-gray-900'
									: 'text-gray-600 group-hover:text-gray-900'
							}`}
						/>
						<span
							class={`whitespace-nowrap text-xs font-medium transition-colors ${
								activeType === placeType.name
									? 'text-gray-900'
									: 'text-gray-600 group-hover:text-gray-900'
							}`}
						>
							{placeType.name}
						</span>
					</div>
					<div
						class={`absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 transition-all duration-200 ${
							activeType === placeType.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
						}`}
					></div>
				</a>
			{/each}
			<Button variant="outline" class="mt-3 rounded-full">
				<ChevronRight class="size-3" />
			</Button>
			<Button variant="outline" class="mt-3 rounded-full">
				<SlidersHorizontal class="size-3" />
				All Filters
			</Button>
		</div>
	</div>
</div>
