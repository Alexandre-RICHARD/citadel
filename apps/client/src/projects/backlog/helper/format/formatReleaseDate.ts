import { formatIsoDate } from "../date/formatIsoDate";
import { getTodayIsoDate } from "../date/getTodayIsoDate";

// Date de sortie : « annulé », « à venir » sans date ou si elle est future, sinon la date
export function formatReleaseDate(
	date: string | null,
	isCancelled: boolean,
): string {
	if (isCancelled) return "annulé";
	if (date === null || date > getTodayIsoDate()) return "à venir";
	return formatIsoDate(date);
}
