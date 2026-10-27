import { formatShortIsoDate } from "@citadel/common/src/universal/date/formatShortIsoDate";
import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";

// Date de sortie : « annulé », « à venir » sans date ou si elle est future, sinon la date
export function formatReleaseDate(
	date: string | null,
	isCancelled: boolean,
): string {
	if (isCancelled) return "annulé";
	if (date === null || date > getTodayIsoDate()) return "à venir";
	return formatShortIsoDate(date);
}
