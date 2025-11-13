const SEARCH_HISTORY_KEY = 'woofs-welcome-search-history';
const MAX_HISTORY_ITEMS = 10;

export type SearchHistoryItem = {
	query: string;
	timestamp: number;
};

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
	if (typeof window === 'undefined') return [];

	try {
		const history = localStorage.getItem(SEARCH_HISTORY_KEY);
		if (!history) return [];

		return JSON.parse(history) as SearchHistoryItem[];
	} catch (error) {
		console.error('Error getting search history:', error);
		return [];
	}
}

/**
 * Add a search query to history
 */
export function addSearchHistory(query: string): void {
	if (typeof window === 'undefined') return;
	if (!query || query.trim().length === 0) return;

	try {
		const history = getSearchHistory();

		// Remove duplicates
		const filtered = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());

		// Add new item to the beginning
		const newHistory = [{ query: query.trim(), timestamp: Date.now() }, ...filtered].slice(
			0,
			MAX_HISTORY_ITEMS
		);

		localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
	} catch (error) {
		console.error('Error adding search history:', error);
	}
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(SEARCH_HISTORY_KEY);
	} catch (error) {
		console.error('Error clearing search history:', error);
	}
}

/**
 * Remove a specific item from search history
 */
export function removeFromSearchHistory(query: string): void {
	if (typeof window === 'undefined') return;

	try {
		const history = getSearchHistory();
		const filtered = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
		localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
	} catch (error) {
		console.error('Error removing search history item:', error);
	}
}
