<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { X, MapPin, Search, Star, SlidersHorizontal } from '@lucide/svelte';
	import type { PlaceType, DogAccess, FilterState, Location } from '$lib/types/models';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	interface Props {
		initialFilters?: Partial<FilterState>;
		onApplyFilters: (filters: FilterState) => void;
	}

	let { initialFilters = {}, onApplyFilters }: Props = $props();

	let drawerOpen = $state<boolean>(false);

	// Filter state
	let selectedLocation = $state<string | null>(initialFilters.location || null);
	let selectedTypes = $state<string[]>(initialFilters.types || []);
	let dogAccess = $state<DogAccess>(initialFilters.dogAccess || 'both');
	let minRating = $state<number>(initialFilters.minRating || 0);
	let isNew = $state<boolean>(initialFilters.isNew || false);
	let isVerified = $state<boolean>(initialFilters.isVerified || false);

	// Location search
	let locationSearch = $state('');
	let locationResults = $state<Location[] | undefined>([]);
	let showLocationDropdown = $state(false);

	// Main cities for quick selection
	const mainCities = [
		{ name: 'Auckland', slug: 'auckland' },
		{ name: 'Hamilton', slug: 'hamilton' },
		{ name: 'Wellington', slug: 'wellington' },
		{ name: 'Christchurch', slug: 'christchurch' },
		{ name: 'Queenstown', slug: 'queenstown' },
		{ name: 'Dunedin', slug: 'dunedin' }
	];

	// All place types
	const placeTypes: PlaceType[] = [
		'Park',
		'Restaurant',
		'Hotel',
		'Motel',
		'AirBnb',
		'Store',
		'Café',
		'Bar',
		'Dog Park',
		'Beach',
		'Walk',
		'Hike',
		'Service',
		'Activity',
		'Lake',
		'River',
		'Trail'
	];

	// Search locations (mock for now - replace with API call)
	async function searchLocations(query: string) {
		if (query.length <= 2) {
			locationResults = [];
			return;
		}

		const results = await api.location.searchLocations(query);
		locationResults = results;
	}

	// Handle location search input
	function handleLocationSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		locationSearch = target.value;
		searchLocations(locationSearch);
		showLocationDropdown = true;
	}

	// Select location
	function selectLocation(location: Location) {
		console.log('Selected location:', location);
		selectedLocation = location.slug;
		locationSearch = location.name;
		showLocationDropdown = false;
	}

	// Clear location
	function clearLocation() {
		selectedLocation = null;
		locationSearch = '';
		locationResults = [];
	}

	// Toggle place type
	function togglePlaceType(type: string) {
		if (selectedTypes.includes(type)) {
			selectedTypes = selectedTypes.filter((t) => t !== type);
		} else {
			selectedTypes = [...selectedTypes, type];
		}
	}

	// Apply filters
	function applyFilters() {
		const filters: FilterState = {
			location: selectedLocation,
			types: selectedTypes,
			dogAccess,
			minRating,
			isNew,
			isVerified
		};
		drawerOpen = false;
		onApplyFilters(filters);
	}

	// Clear all filters
	function clearAllFilters() {
		selectedLocation = null;
		locationSearch = '';
		selectedTypes = [];
		dogAccess = 'both';
		minRating = 0;
		locationResults = [];
		isNew = false;
		isVerified = false;
		goto('/explore');
	}

	// Check if filters have changed
	let hasActiveFilters = $derived(
		selectedLocation !== null ||
			selectedTypes.length > 0 ||
			dogAccess !== 'both' ||
			minRating > 0 ||
			isNew ||
			isVerified
	);

	// Get active filter count
	let activeFilterCount = $derived(
		(selectedLocation ? 1 : 0) +
			selectedTypes.length +
			(dogAccess !== 'both' ? 1 : 0) +
			(minRating > 0 ? 1 : 0) +
			(isNew ? 1 : 0) +
			(isVerified ? 1 : 0)
	);
</script>

<!-- Desktop -->
<aside class="hidden space-y-6 p-4 lg:block">
	<div class="space-y-6 p-4">
		<!-- Active Filters Header -->
		{#if hasActiveFilters}
			<div class="border-b pb-4">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-medium">Active Filters ({activeFilterCount})</h3>
					<Button variant="ghost" size="sm" onclick={clearAllFilters}>Clear All</Button>
				</div>
				<div class="flex flex-wrap gap-2">
					{#if selectedLocation}
						<Badge variant="secondary" class="gap-1">
							{selectedLocation}
							<button onclick={clearLocation} class="ml-1 cursor-pointer">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
					{#each selectedTypes as type}
						<Badge variant="secondary" class="gap-1">
							{type}
							<button onclick={() => togglePlaceType(type)} class="ml-1">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/each}
					{#if dogAccess !== 'both'}
						<Badge variant="secondary" class="gap-1">
							{dogAccess === 'indoor' ? 'Indoor Only' : 'Outdoor Only'}
							<button onclick={() => (dogAccess = 'both')} class="ml-1">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
					{#if minRating > 0}
						<Badge variant="secondary" class="gap-1">
							{minRating}+ <Star class="h-3 w-3 fill-yellow-500 text-yellow-500" />
							<button onclick={() => (minRating = 0)} class="ml-1">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
					{#if isNew}
						<Badge variant="secondary" class="gap-1">
							New
							<button onclick={() => (isNew = false)} class="ml-1">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}

					{#if isVerified}
						<Badge variant="secondary" class="gap-1">
							Verified
							<button onclick={() => (isVerified = false)} class="ml-1">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Location Filter -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label class="flex items-center gap-2 text-base font-semibold">
					<MapPin class="h-4 w-4" />
					Location
				</Label>
				{#if selectedLocation}
					<Button
						variant="ghost"
						onclick={clearLocation}
						class="text-muted-foreground hover:text-foreground text-xs"
					>
						Clear
					</Button>
				{/if}
			</div>

			<!-- Location Search -->
			<div class="relative w-full">
				<Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
				<Input
					type="text"
					placeholder="Search locations..."
					value={locationSearch}
					oninput={handleLocationSearch}
					onfocus={() => (showLocationDropdown = true)}
					onblur={() => setTimeout(() => (showLocationDropdown = false), 200)}
					class="rounded-full pl-9"
				/>
				<!-- Search Dropdown -->
				{#if showLocationDropdown && locationResults && locationResults.length > 0}
					<div
						class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
					>
						{#each locationResults as location}
							<button
								onclick={() => selectLocation(location)}
								class="hover:bg-muted w-full cursor-pointer px-4 py-2 text-left text-sm"
							>
								<div class="font-medium">{location.name}</div>
								<div class="text-muted-foreground text-xs">
									{location.displayName} - ({location.placeCount} places)
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Main Cities Quick Select -->
			<div class="space-y-2">
				<p class="text-muted-foreground text-xs">Popular Cities</p>
				<div class="flex flex-wrap gap-2">
					{#each mainCities as city}
						<Button
							variant={selectedLocation === city.slug ? 'default' : 'outline'}
							size="sm"
							onclick={() => {
								selectedLocation = city.slug;
								locationSearch = city.name;
							}}
							class="rounded-full text-xs"
						>
							{city.name}
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Type of Place Filter -->
		<div class="space-y-3 border-t pt-6">
			<Label class="text-base font-semibold">Type of Place</Label>
			<div class="max-h-full space-y-2 overflow-y-auto">
				{#each placeTypes.sort((a, b) => a.localeCompare(b)) as type}
					<div class="flex items-center space-x-2">
						<Checkbox
							id={type}
							checked={selectedTypes.includes(type)}
							onCheckedChange={() => togglePlaceType(type)}
						/>
						<Label for={type} class="cursor-pointer text-sm font-normal">
							{type}
						</Label>
					</div>
				{/each}
			</div>
		</div>

		<!-- Dog Access Filter -->
		<div class="space-y-3 border-t pt-6">
			<Label class="text-base font-semibold">Dog Access</Label>
			<div class="flex gap-2">
				<Button
					variant={dogAccess === 'indoor' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (dogAccess = 'indoor')}
					class="flex-1"
				>
					Indoor
				</Button>
				<Button
					variant={dogAccess === 'outdoor' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (dogAccess = 'outdoor')}
					class="flex-1"
				>
					Outdoor
				</Button>
				<Button
					variant={dogAccess === 'both' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (dogAccess = 'both')}
					class="flex-1"
				>
					Both
				</Button>
			</div>
		</div>

		<!-- Rating Filter -->
		<div class="space-y-3 border-t pt-6">
			<div class="flex items-center justify-between">
				<Label class="text-base font-semibold">Minimum Rating</Label>
				{#if minRating > 0}
					<span class="flex items-center text-sm font-medium"
						>{minRating}+ <Star class="h-4 w-4 fill-yellow-500 text-yellow-500" />
					</span>
				{:else}
					<span class="text-sm font-medium">Any</span>
				{/if}
			</div>
			<Slider type="single" bind:value={minRating} min={0} max={5} step={0.5} class="w-full" />
			<div class="text-muted-foreground flex justify-between text-xs">
				<span>Any</span>
				<span>5 Stars</span>
			</div>
		</div>

		<!-- New/Verified Filters -->
		<div class="space-y-3 border-t pt-6">
			<Label class="text-base font-semibold">Additional Filters</Label>

			<div class="space-y-3">
				<!-- New Places Filter -->
				<div class="flex items-center space-x-2">
					<Checkbox
						id="isNew"
						checked={isNew}
						onCheckedChange={(checked) => (isNew = checked === true)}
					/>
					<Label for="isNew" class="cursor-pointer text-sm font-normal">
						New (Added in last 2 months)
					</Label>
				</div>

				<!-- Verified Places Filter -->
				<div class="flex items-center space-x-2">
					<Checkbox
						id="isVerified"
						checked={isVerified}
						onCheckedChange={(checked) => (isVerified = checked === true)}
					/>
					<Label for="isVerified" class="cursor-pointer text-sm font-normal">
						Verified Places Only
					</Label>
				</div>
			</div>
		</div>

		<!-- Apply Filters Button -->
		<div class="sticky bottom-0 border-t bg-white p-4">
			<Button onclick={applyFilters} class="w-full" size="lg">Apply Filters</Button>
		</div>
	</div>
</aside>

<!-- MOBILE DRAWER -->
<aside class="lg:hidden">
	<Drawer.Root bind:open={drawerOpen}>
		<Drawer.Trigger>
			<div
				class="fixed bottom-0 z-50 h-[5.5rem] w-full rounded-t-lg border-t-2 bg-white shadow-2xl transition-shadow hover:shadow-2xl"
			>
				<div
					role="button"
					class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-zinc-200 dark:bg-zinc-700"
				></div>
				<div class="flex w-full items-center justify-between gap-3 px-4 py-3">
					<div class="relative w-10/12">
						<Search
							class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
						/>
						<Input
							type="text"
							placeholder="Search dog-friendly places..."
							class="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2"
						/>
					</div>
					{#if activeFilterCount > 0}
						<div class="bg-primary flex w-12 items-center gap-1.5 rounded-full px-2.5 py-1">
							<SlidersHorizontal class="text-primary-foreground h-3.5 w-3.5" />
							<span class="text-primary-foreground text-xs font-semibold">
								{activeFilterCount}
							</span>
						</div>
					{:else}
						<div class="bg-muted rounded-full p-1.5">
							<SlidersHorizontal class="text-muted-foreground h-4 w-4" />
						</div>
					{/if}
				</div>
			</div>
		</Drawer.Trigger>
		<Drawer.Content class="max-h-[90vh]">
			<div class="flex w-full items-center justify-between gap-3 px-4 py-3">
				<div class="relative w-10/12">
					<Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
					<Input
						type="text"
						placeholder="Search dog-friendly places..."
						class="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-full border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2"
					/>
				</div>
				{#if activeFilterCount > 0}
					<div class="bg-primary flex w-12 items-center gap-1.5 rounded-full px-2.5 py-1">
						<SlidersHorizontal class="text-primary-foreground h-3.5 w-3.5" />
						<span class="text-primary-foreground text-xs font-semibold">
							{activeFilterCount}
						</span>
					</div>
				{:else}
					<div class="bg-muted rounded-full p-1.5">
						<SlidersHorizontal class="text-muted-foreground h-4 w-4" />
					</div>
				{/if}
			</div>
			<div class="p-4">
				<Drawer.Title class="text-lg font-semibold">Filters</Drawer.Title>
			</div>
			<Separator />
			<div class="space-y-6 overflow-y-auto px-4 pb-4">
				<!-- Active Filters Header -->
				{#if hasActiveFilters}
					<div class="border-b pb-4 pt-4">
						<div class="mb-3 flex items-center justify-between">
							<h3 class="text-sm font-semibold">
								Active Filters ({activeFilterCount})
							</h3>
							<Button variant="ghost" size="sm" onclick={clearAllFilters}>Clear All</Button>
						</div>
						<div class="flex flex-wrap gap-2">
							{#if selectedLocation}
								<Badge variant="secondary" class="gap-1">
									{selectedLocation}
									<button onclick={clearLocation} class="ml-1">
										<X class="h-3 w-3" />
									</button>
								</Badge>
							{/if}
							{#each selectedTypes as type}
								<Badge variant="secondary" class="gap-1">
									{type}
									<button onclick={() => togglePlaceType(type)} class="ml-1">
										<X class="h-3 w-3" />
									</button>
								</Badge>
							{/each}
							{#if dogAccess !== 'both'}
								<Badge variant="secondary" class="gap-1">
									{dogAccess === 'indoor' ? 'Indoor Only' : 'Outdoor Only'}
									<button onclick={() => (dogAccess = 'both')} class="ml-1">
										<X class="h-3 w-3" />
									</button>
								</Badge>
							{/if}
							{#if minRating > 0}
								<Badge variant="secondary" class="gap-1">
									{minRating}+ <Star class="h-3 w-3 fill-yellow-500 text-yellow-500" />
									<button onclick={() => (minRating = 0)} class="ml-1">
										<X class="h-3 w-3" />
									</button>
								</Badge>
							{/if}
							{#if isNew}
								<Badge variant="secondary" class="gap-1">
									New
									<button onclick={() => (isNew = false)} class="ml-1">
										<X class="h-3 w-3" />
									</button>
								</Badge>
							{/if}

							{#if isVerified}
								<Badge variant="secondary" class="gap-1">
									Verified
									<button onclick={() => (isVerified = false)} class="ml-1">
										<X class="h-3 w-3" />
									</button>
								</Badge>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Location Filter -->
				<div class="mt-4 space-y-3">
					<div class="flex items-center justify-between">
						<Label class="flex items-center gap-2 text-base font-semibold">
							<MapPin class="h-4 w-4" />
							Location
						</Label>
						{#if selectedLocation}
							<Button
								variant="ghost"
								size="sm"
								onclick={clearLocation}
								class="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
							>
								Clear
							</Button>
						{/if}
					</div>

					<!-- Location Search -->
					<div class="relative">
						<Search
							class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
						/>
						<Input
							type="text"
							placeholder="Search locations..."
							value={locationSearch}
							oninput={handleLocationSearch}
							onfocus={() => (showLocationDropdown = true)}
							onblur={() => setTimeout(() => (showLocationDropdown = false), 200)}
							class="pl-9"
						/>

						<!-- Search Dropdown -->
						{#if showLocationDropdown && locationResults && locationResults.length > 0}
							<div
								class="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
							>
								{#each locationResults as location}
									<button
										onclick={() => selectLocation(location)}
										class="hover:bg-muted w-full px-4 py-2 text-left text-sm"
									>
										<div class="font-medium">{location.name}</div>
										<div class="text-muted-foreground text-xs">
											{location.name}, {location.region}
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Main Cities Quick Select -->
					<div class="space-y-2">
						<p class="text-muted-foreground text-xs">Popular Cities</p>
						<div class="flex flex-wrap gap-2">
							{#each mainCities as city}
								<Button
									variant={selectedLocation === city.slug ? 'default' : 'outline'}
									size="sm"
									onclick={() => {
										selectedLocation = city.slug;
										locationSearch = city.name;
									}}
									class="text-xs"
								>
									{city.name}
								</Button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Type of Place Filter -->
				<div class="space-y-3 border-t pt-6">
					<Label class="text-base font-semibold">Type of Place</Label>
					<div class="max-h-full space-y-2 overflow-y-auto">
						{#each placeTypes.sort((a, b) => a.localeCompare(b)) as type}
							<div class="flex items-center space-x-2">
								<Checkbox
									id={`mobile-${type}`}
									checked={selectedTypes.includes(type)}
									onCheckedChange={() => togglePlaceType(type)}
								/>
								<Label for={`mobile-${type}`} class="cursor-pointer text-sm font-normal">
									{type}
								</Label>
							</div>
						{/each}
					</div>
				</div>

				<!-- Dog Access Filter -->
				<div class="space-y-3 border-t pt-6">
					<Label class="text-base font-semibold">Dog Access</Label>
					<div class="flex gap-2">
						<Button
							variant={dogAccess === 'indoor' ? 'default' : 'outline'}
							size="sm"
							onclick={() => (dogAccess = 'indoor')}
							class="flex-1"
						>
							Indoor
						</Button>
						<Button
							variant={dogAccess === 'outdoor' ? 'default' : 'outline'}
							size="sm"
							onclick={() => (dogAccess = 'outdoor')}
							class="flex-1"
						>
							Outdoor
						</Button>
						<Button
							variant={dogAccess === 'both' ? 'default' : 'outline'}
							size="sm"
							onclick={() => (dogAccess = 'both')}
							class="flex-1"
						>
							Both
						</Button>
					</div>
				</div>

				<!-- Rating Filter -->
				<div class="space-y-4 border-t pt-6">
					<div class="flex items-center justify-between">
						<Label class="text-base font-semibold">Minimum Rating</Label>
						<span class="text-muted-foreground text-sm font-medium">
							{minRating > 0 ? `${minRating}+` : 'Any'}
						</span>
					</div>
					<div class="px-1">
						<Slider
							type="single"
							bind:value={minRating}
							min={0}
							max={5}
							step={0.5}
							class="w-full"
						/>
						<div class="text-muted-foreground mt-2 flex justify-between px-1 text-xs">
							<span>Any</span>
							<span>1</span>
							<span>2</span>
							<span>3</span>
							<span>4</span>
							<span>5</span>
						</div>
					</div>

					<!-- New/Verified Filters -->
					<!-- Additional Filters -->
					<div class="space-y-3 border-t pt-6">
						<Label class="text-base font-semibold">Additional Filters</Label>

						<div class="space-y-3">
							<!-- New Places Filter -->
							<div class="flex items-center space-x-2">
								<Checkbox
									id="isNew"
									checked={isNew}
									onCheckedChange={(checked) => (isNew = checked === true)}
								/>
								<Label for="isNew" class="cursor-pointer text-sm font-normal">
									New (Added in last 2 months)
								</Label>
							</div>

							<!-- Verified Places Filter -->
							<div class="flex items-center space-x-2">
								<Checkbox
									id="isVerified"
									checked={isVerified}
									onCheckedChange={(checked) => (isVerified = checked === true)}
								/>
								<Label for="isVerified" class="cursor-pointer text-sm font-normal">
									Verified Places Only
								</Label>
							</div>
						</div>
					</div>

					<!-- Apply Filters Button -->
					<div class="z-50 bg-white pt-6">
						<Button onclick={applyFilters} class="w-full" size="lg">Apply Filters</Button>
					</div>
				</div>
			</div>
		</Drawer.Content>
	</Drawer.Root>
</aside>
