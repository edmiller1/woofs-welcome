import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: process.env.PUBLIC_SENTRY_DSN,
	environment: process.env.PUBLIC_NODE_ENV || 'development',
	tracesSampleRate: 1.0
});

export const handleError = Sentry.handleErrorWithSentry();

export const handle = sequence(Sentry.sentryHandle());
