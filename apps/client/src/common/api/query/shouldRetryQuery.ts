import { isTransientApiError } from "../error/isTransientApiError";

const MAX_QUERY_RETRIES = 2;

// Une lecture n'est rejouée que si son échec est passager ; une 4xx redonnerait le même résultat.
// `failureCount` vaut 0 au premier échec
export function shouldRetryQuery(
	failureCount: number,
	error: unknown,
): boolean {
	return failureCount < MAX_QUERY_RETRIES && isTransientApiError(error);
}
