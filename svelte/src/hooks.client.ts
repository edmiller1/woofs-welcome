import { initSentry } from '$lib/sentry-client';
import { handleErrorWithSentry, replayIntegration } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

// Initialize Sentry
initSentry();

// Handle errors
export const handleError = handleErrorWithSentry();

// Optional: If you want to add custom error handling
// export const handleError = handleErrorWithSentry((input) => {
//   console.error('Client error:', input.error);
//   return {
//     message: 'An unexpected error occurred',
//   };
// });
