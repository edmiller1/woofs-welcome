import { authClient } from './auth-client';
import type { Session } from './auth-client';

interface CachedSession {
	data: Session | null;
	timestamp: number;
}

class SessionCache {
	private cache: CachedSession | null = null;
	private pendingRequest: Promise<{ data: Session | null }> | null = null;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

	/**
	 * Get session with caching
	 */
	async getSession(): Promise<{ data: Session | null }> {
		// If there's a pending request, wait for it
		if (this.pendingRequest) {
			return this.pendingRequest;
		}

		// Check if cache is valid
		if (this.isCacheValid()) {
			return { data: this.cache!.data };
		}

		// Fetch new session
		this.pendingRequest = this.fetchSession();

		try {
			const result = await this.pendingRequest;
			return result;
		} finally {
			this.pendingRequest = null;
		}
	}

	/**
	 * Fetch session from server
	 */
	private async fetchSession(): Promise<{ data: Session | null }> {
		try {
			const result = await authClient.getSession();

			// Update cache
			this.cache = {
				data: result.data,
				timestamp: Date.now()
			};

			return result;
		} catch (error) {
			console.error('Failed to fetch session:', error);
			// Don't cache errors
			return { data: null };
		}
	}

	/**
	 * Check if cache is still valid
	 */
	private isCacheValid(): boolean {
		if (!this.cache) return false;

		const age = Date.now() - this.cache.timestamp;
		return age < this.CACHE_DURATION;
	}

	/**
	 * Invalidate cache (call after sign-in/sign-out)
	 */
	invalidate(): void {
		this.cache = null;
		this.pendingRequest = null;
	}

	/**
	 * Update cache directly (use after successful auth operations)
	 */
	setSession(session: Session | null): void {
		this.cache = {
			data: session,
			timestamp: Date.now()
		};
	}

	/**
	 * Clear cache completely
	 */
	clear(): void {
		this.cache = null;
		this.pendingRequest = null;
	}
}

// Export singleton instance
export const sessionCache = new SessionCache();
