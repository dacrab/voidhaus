import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import type { HandleServerError } from '@sveltejs/kit';

export const handle = sequence(sentryHandle());

export const handleError = handleErrorWithSentry() satisfies HandleServerError;
