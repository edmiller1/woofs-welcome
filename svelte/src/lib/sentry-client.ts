import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN, PUBLIC_NODE_ENV } from '$env/static/public';

export function initSentry() {
	if (!PUBLIC_SENTRY_DSN) {
		console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
		return;
	}

	Sentry.init({
		dsn: PUBLIC_SENTRY_DSN,
		environment: PUBLIC_NODE_ENV || 'development',

		// Performance monitoring
		tracesSampleRate: PUBLIC_NODE_ENV === 'production' ? 0.1 : 1.0,

		// Session replay
		replaysSessionSampleRate: 0.1, // 10% of sessions
		replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

		// Don't send errors in development
		enabled: PUBLIC_NODE_ENV === 'production',

		integrations: [
			Sentry.replayIntegration({
				maskAllText: true,
				blockAllMedia: true
			}),
			Sentry.browserTracingIntegration()
		],

		// Filter out sensitive data
		beforeSend(event, hint) {
			// Don't send certain errors
			if (event.exception) {
				const error = hint.originalException;

				// Don't send auth errors
				if (error && typeof error === 'object' && 'statusCode' in error) {
					const statusCode = error.statusCode as number;
					if (statusCode === 401 || statusCode === 403) {
						return null;
					}
				}
			}

			// Remove sensitive data
			if (event.request) {
				delete event.request.cookies;
				if (event.request.headers) {
					delete event.request.headers['authorization'];
					delete event.request.headers['cookie'];
				}
			}

			return event;
		}
	});

	console.log('✅ Sentry (client) initialized');
}
