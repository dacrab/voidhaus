import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(sentryHandle());

export const handleError = handleErrorWithSentry();
