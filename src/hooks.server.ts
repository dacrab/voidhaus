import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
import type { HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

export const handle = sequence(sentryHandle());

export const handleError = handleErrorWithSentry() satisfies HandleServerError;
