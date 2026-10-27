import { formatUtcIsoDate } from "@citadel/common/src/universal/date/formatUtcIsoDate.ts";
import { fromUnixSecondsToDate } from "@citadel/common/src/universal/date/fromUnixSecondsToDate.ts";

// Timestamp Unix d'IGDB (en secondes, 00:00 UTC du jour annoncé) → date ISO ; null sans date
export function fromIgdbTimestampToIsoDate(
	seconds: number | undefined,
): string | null {
	return seconds === undefined
		? null
		: formatUtcIsoDate(fromUnixSecondsToDate(seconds));
}
