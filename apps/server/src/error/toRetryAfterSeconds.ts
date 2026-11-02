import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";

// L'en-tête Retry-After compte en secondes entières, arrondies au-dessus, et au moins une : un Retry-After de 0
// inviterait à réessayer aussitôt
export function toRetryAfterSeconds(retryAfterMs: number): number {
	return Math.max(1, Math.ceil(retryAfterMs / DurationMsEnum.SECOND));
}
