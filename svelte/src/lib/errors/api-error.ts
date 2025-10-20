/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
	constructor(
		public message: string,
		public statusCode: number,
		public code?: string,
		public details?: Array<{ field: string; message: string }>
	) {
		super(message);
		this.name = 'ApiError';
	}

	/**
	 * Check if it's a client error (4xx)
	 */
	get isClientError(): boolean {
		return this.statusCode >= 400 && this.statusCode < 500;
	}

	/**
	 * Check if it's a server error (5xx)
	 */
	get isServerError(): boolean {
		return this.statusCode >= 500;
	}

	/**
	 * Check if it's a specific error type
	 */
	is(code: string): boolean {
		return this.code === code;
	}
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

/**
 * Parse error from axios response
 */
export function parseApiError(error: any): ApiError {
	// Axios error with response
	if (error.response) {
		const { data, status } = error.response;

		return new ApiError(
			data?.error?.message || data?.error || 'An error occurred',
			status,
			data?.error?.code,
			data?.error?.details
		);
	}

	// Axios error without response (network error)
	if (error.request) {
		return new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
	}

	// Other errors
	return new ApiError(error.message || 'An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
	if (isApiError(error)) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'An unexpected error occurred';
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(
	details?: Array<{ field: string; message: string }>
): Record<string, string> {
	if (!details) return {};

	return details.reduce(
		(acc, { field, message }) => {
			acc[field] = message;
			return acc;
		},
		{} as Record<string, string>
	);
}
