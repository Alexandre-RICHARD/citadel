import { pluralize } from "@citadel/common/src/universal/string/pluralize";

import type { MailFailureSummary } from "../../shared/mailFailureSummary.type";
import { formatDateTime } from "./formatDateTime";

type MailFailuresDescription = {
	// La pastille de la carte
	status: string;
	message: string;
	// null : aucune date d'échec
	detail: string | null;
};

// L'alerte de la carte Site, quand des emails n'ont pas pu partir ; null s'il n'y en a aucun
export function describeMailFailures(
	summary: MailFailureSummary | null,
): MailFailuresDescription | null {
	if (summary === null || summary.count === 0) return null;

	const { count, windowDays, lastFailedAt } = summary;
	const isPlural = count > 1;
	return {
		status: `${pluralize(count, "email")} non ${isPlural ? "partis" : "parti"}`,
		message: `${pluralize(count, "email")} du site ${isPlural ? "n'ont" : "n'a"} pas pu partir ces ${windowDays} derniers jours.`,
		detail:
			lastFailedAt === null
				? null
				: `Dernier échec : ${formatDateTime(new Date(lastFailedAt))}. Détail en base : mailing_failure, error_log.`,
	};
}
