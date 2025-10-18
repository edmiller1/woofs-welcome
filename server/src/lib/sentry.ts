import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "../config/env";

const SENTRY_DSN = env.SENTRY_DSN;
const NODE_ENV = env.NODE_ENV || "development";

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn("⚠️  Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,

    // Performance monitoring
    tracesSampleRate: NODE_ENV === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Profiling
    profilesSampleRate: NODE_ENV === "production" ? 0.1 : 1.0,

    integrations: [nodeProfilingIntegration()],

    // Don't send errors in development
    enabled: NODE_ENV === "production",

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
        }
      }
      return event;
    },
  });
  console.log("✅ Sentry initialized");
}

export { Sentry };
