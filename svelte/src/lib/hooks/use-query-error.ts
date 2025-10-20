import { toast } from 'svelte-sonner';
import { getErrorMessage, isApiError } from '$lib/errors';
import * as Sentry from '@sentry/sveltekit';

/**
 * Standard error handler for TanStack Query
 */
export function handleQueryError(error: unknown) {
	const message = getErrorMessage(error);

	if (isApiError(error) && error.isServerError) {
		Sentry.captureException(error, {
			tags: {
				errorType: 'api_error',
				statusCode: error.statusCode,
				errorCode: error.code
			}
		});
	}

	// Don't show toast for certain errors
	if (isApiError(error)) {
		// Don't show toast for 401/403 (auth will handle)
		if (error.statusCode === 401 || error.statusCode === 403) {
			return;
		}

		// Don't show toast for 404 on optional queries
		if (error.statusCode === 404) {
			return;
		}
	}

	toast.error(message);
}

/**
 * Standard success handler for mutations
 */
export function handleMutationSuccess(message: string = 'Success!') {
	toast.success(message);
}

/**
 * Track custom events to Sentry
 */
export function trackEvent(eventName: string, data?: Record<string, any>) {
	Sentry.captureMessage(eventName, {
		level: 'info',
		extra: data
	});
}
