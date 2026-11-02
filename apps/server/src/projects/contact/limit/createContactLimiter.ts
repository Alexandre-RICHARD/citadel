import { getParisDay } from "@citadel/common/src/universal/date/getParisDay.ts";
import { createSlidingWindowLimiter } from "@citadel/common/src/universal/limit/createSlidingWindowLimiter.ts";

import { groupIpForLimits } from "../../../common/network/groupIpForLimits.ts";

const HOUR_MS = 3_600_000;

/**
 * Les limites du formulaire, pour la réputation du domaine et le quota de mails : des messages par heure et par IP, et un
 * accusé de réception par adresse et par jour. En mémoire (une seule instance du serveur), remis à zéro à chaque
 * déploiement. Le plafond global du jour, lui, est le seuil MAIL_CONTACT_STOP du quota
 */
export function createContactLimiter(
	hourlyLimitPerIp: number,
	now: () => number = Date.now,
) {
	const messagesPerIp = createSlidingWindowLimiter({
		limit: hourlyLimitPerIp,
		windowMs: HOUR_MS,
		now,
	});
	let acknowledgementDay = "";
	let acknowledgedEmails = new Set<string>();

	/**
	 * Compte un message de cette IP (de son /64 en IPv6) et renvoie null ; au-delà de la limite, rien n'est compté et la
	 * réponse est le délai avant de pouvoir réessayer, en millisecondes
	 */
	function recordMessage(ip: string): number | null {
		return messagesPerIp.record(groupIpForLimits(ip));
	}

	// Vrai la première fois du jour (heure de Paris) pour cette adresse, majuscules comprises : l'accusé peut partir
	function claimAcknowledgement(email: string): boolean {
		const day = getParisDay(now());
		if (acknowledgementDay !== day) {
			acknowledgementDay = day;
			acknowledgedEmails = new Set();
		}

		const normalizedEmail = email.toLowerCase();
		if (acknowledgedEmails.has(normalizedEmail)) return false;
		acknowledgedEmails.add(normalizedEmail);
		return true;
	}

	return { recordMessage, claimAcknowledgement };
}
