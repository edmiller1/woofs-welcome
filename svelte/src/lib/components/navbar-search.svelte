<script lang="ts">
	import { Search, Clock, X, LoaderCircle, Star } from '@lucide/svelte';
	import { api } from '$lib/api';
	import type { PlaceWithOptimizedImages } from '$lib/types/models';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		addSearchHistory,
		clearSearchHistory,
		getSearchHistory,
		removeFromSearchHistory,
		type SearchHistoryItem
	} from '$lib/utils/search-history';

	//state
	let searchQuery = $state<string>('');
	let isOpen = $state<boolean>(false);
	let isLoading = $state<boolean>(false);
	let suggestions = $state<PlaceWithOptimizedImages[]>([]);
	let searchHistory = $state<SearchHistoryItem[]>([]);
	let selectedIndex = $state(-1);
	let searchInputRef: HTMLInputElement;
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Combined list of suggestions and history
	const allItems = $derived([
		...searchHistory.map((h) => ({ type: 'history' as const, data: h })),
		...suggestions.map((s) => ({ type: 'suggestion' as const, data: s }))
	]);

	// Load search history on mount
	onMount(() => {
		searchHistory = getSearchHistory();
	});

	// Debounced search function
	async function performSearch(query: string) {
		if (query.length < 3) {
			suggestions = [];
			isLoading = false;
			return;
		}

		isLoading = true;

		try {
			const results = await api.place.searchPlaces(query, 10);
			console.log('Search results:', results); // Debug log
			suggestions = results;
		} catch (error) {
			console.error('Search failed:', error);
			suggestions = [];
		} finally {
			isLoading = false;
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		selectedIndex = -1;

		clearTimeout(debounceTimer);

		if (searchQuery.length === 0) {
			suggestions = [];
			isLoading = false;
			return;
		}

		if (searchQuery.length < 3) {
			suggestions = [];
			return;
		}

		// Set new timer for debounce (300ms)
		isLoading = true;
		debounceTimer = setTimeout(() => {
			performSearch(searchQuery);
		}, 300);
	}

	// Handle focus - open dropdown and load history
	function handleFocus() {
		isOpen = true;
		searchHistory = getSearchHistory();
	}

	// Handle blur - close dropdown (with delay for clicks)
	function handleBlur() {
		setTimeout(() => {
			isOpen = false;
			selectedIndex = -1;
		}, 200);
	}

	// Navigate to explore page with search query
	function navigateToSearch(query: string) {
		addSearchHistory(query);
		searchQuery = '';
		suggestions = [];
		isOpen = false;
		goto(`/explore?search=${encodeURIComponent(query)}`);
	}

	// Handle suggestion click
	function handleSuggestionClick(suggestion: PlaceWithOptimizedImages) {
		addSearchHistory(suggestion.name);
		searchQuery = '';
		suggestions = [];
		isOpen = false;
		goto(`/explore?place=${suggestion.slug}`);
	}

	// Handle history item click
	function handleHistoryItemClick(item: SearchHistoryItem) {
		searchQuery = item.query;
		searchInputRef.focus();
		performSearch(item.query);
	}

	// Remove history item
	function handleRemoveHistory(e: Event, query: string) {
		e.stopPropagation();
		removeFromSearchHistory(query);
		searchHistory = getSearchHistory();
	}

	// Clear all history
	function handleClearHistory() {
		clearSearchHistory();
		searchHistory = [];
	}

	// Handle keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, allItems.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex === -1) {
					// Submit current query
					if (searchQuery.length >= 3) {
						navigateToSearch(searchQuery);
					}
				} else {
					// Select highlighted item
					const item = allItems[selectedIndex];
					if (item.type === 'history') {
						handleHistoryItemClick(item.data);
					} else {
						handleSuggestionClick(item.data);
					}
				}
				break;
			case 'Escape':
				isOpen = false;
				searchInputRef.blur();
				break;
		}
	}

	// Handle form submit
	function handleSubmit(e: Event) {
		e.preventDefault();
		if (searchQuery.length >= 3) {
			navigateToSearch(searchQuery);
		}
	}
</script>

<div class="relative mx-8 hidden max-w-xl flex-1 lg:block">
	<form onsubmit={handleSubmit}>
		<div class="relative">
			<Search class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
			<input
				bind:this={searchInputRef}
				type="text"
				placeholder="Search dog-friendly places..."
				value={searchQuery}
				oninput={handleInput}
				onfocus={handleFocus}
				onblur={handleBlur}
				onkeydown={handleKeydown}
				class="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2"
			/>
			{#if isLoading}
				<LoaderCircle
					class="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin"
				/>
			{:else if searchQuery.length > 0}
				<button
					type="button"
					onclick={() => {
						searchQuery = '';
						suggestions = [];
						searchInputRef.focus();
					}}
					class="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
				>
					<X class="h-4 w-4" />
				</button>
			{/if}
		</div>
	</form>

	<!-- Dropdown -->
	{#if isOpen && (searchHistory.length > 0 || suggestions.length > 0 || searchQuery.length >= 3)}
		<div
			class="absolute z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border bg-white shadow-lg"
		>
			<!-- Search History -->
			{#if searchHistory.length > 0 && searchQuery.length < 3}
				<div class="p-2">
					<div class="flex items-center justify-between px-3 py-2">
						<p class="text-muted-foreground text-xs font-semibold uppercase">Recent Searches</p>
						<button
							type="button"
							onclick={handleClearHistory}
							class="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
						>
							Clear all
						</button>
					</div>
					{#each searchHistory as item, index}
						{@const isSelected = selectedIndex === index}
						<div
							role="button"
							aria-roledescription="clickable item"
							tabindex="0"
							onkeydown={(e) => handleKeydown(e)}
							onclick={() => handleHistoryItemClick(item)}
							class={`hover:bg-muted flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
								isSelected ? 'bg-muted' : ''
							}`}
						>
							<Clock class="text-muted-foreground h-4 w-4 flex-shrink-0" />
							<span class="flex-1 text-sm">{item.query}</span>
							<button
								type="button"
								onclick={(e) => handleRemoveHistory(e, item.query)}
								class="hover:bg-background cursor-pointer rounded p-1"
							>
								<X class="text-muted-foreground h-3 w-3" />
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Suggestions -->
			{#if suggestions.length > 0}
				<div class="p-2">
					{#if searchHistory.length > 0 && searchQuery.length >= 3}
						<div class="px-3 py-2">
							<p class="text-muted-foreground text-xs font-semibold uppercase">Suggestions</p>
						</div>
					{/if}
					{#each suggestions as place, index}
						{@const adjustedIndex = searchQuery.length >= 3 ? index + searchHistory.length : index}
						{@const isSelected = selectedIndex === adjustedIndex}
						<button
							type="button"
							onclick={() => handleSuggestionClick(place)}
							class={`hover:bg-muted flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
								isSelected ? 'bg-muted' : ''
							}`}
						>
							<!-- Image -->
							{#if place.images && place.images[0]?.src}
								<img
									src={place.images[0].responsive.xs}
									alt={place.name}
									class="h-12 w-12 flex-shrink-0 rounded object-cover"
									srcset={place.images[0].srcset}
								/>
							{:else}
								<div class="bg-muted h-12 w-12 flex-shrink-0 rounded"></div>
							{/if}

							<!-- Info -->
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{place.name}</p>
								<p class="text-muted-foreground truncate text-xs">
									{place.types[0]}
									{#if place.city}
										• {place.city.name}, {place.city.region.name}
									{/if}
								</p>
							</div>

							<!-- Rating -->
							{#if place.rating && Number(place.rating) > 0}
								<div class="flex flex-shrink-0 items-center gap-1">
									<span class="flex items-center gap-1 text-xs font-medium"
										><Star class="size-4 fill-yellow-500 text-yellow-500" />
										{Number(place.rating).toFixed(1)}</span
									>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- No results -->
			{#if searchQuery.length >= 3 && suggestions.length === 0 && !isLoading}
				<div class="text-muted-foreground p-4 text-center text-sm">
					No places found for "{searchQuery}"
				</div>
			{/if}
		</div>
	{/if}
</div>
