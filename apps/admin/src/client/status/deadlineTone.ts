import type { DeadlineItem } from "../../shared/deadlineItem.type";
import type { StatusTone } from "./statusTone.type";

const DAY_MS = 86_400_000;

// Caddy renouvelle ses certificats 30 jours avant la fin (20 pour les plus courts) :
// à moins de 14 jours, le renouvellement échoue : deux semaines pour s'en occuper.
// Un espace (le Drive) : orange à 80 %, rouge à 95 % (les sauvegardes n'y entrent plus).
export function deadlineTone(item: DeadlineItem, now: number): StatusTone {
	if (item.problem) return "danger";
	if (item.usage) {
		const ratio = item.usage.usedBytes / item.usage.totalBytes;
		if (ratio >= 0.95) return "danger";
		if (ratio >= 0.8) return "warn";
		return "ok";
	}
	if (!item.expiresAt) return "ok";
	const daysLeft = (Date.parse(item.expiresAt) - now) / DAY_MS;
	if (daysLeft < 7) return "danger";
	if (daysLeft < 14) return "warn";
	return "ok";
}
