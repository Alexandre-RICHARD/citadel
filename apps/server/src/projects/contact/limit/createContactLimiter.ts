import { getParisDay } from "../../../mail/quota/getParisDay.ts";

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
	// Heures d'envoi de la dernière heure, par IP
	const messageTimesByIp = new Map<string, number[]>();
	let acknowledgementDay = "";
	let acknowledgedEmails = new Set<string>();

	// Une IP sans message depuis une heure disparaît : la mémoire ne grandit pas avec les visiteurs passés
	function forgetMessagesBefore(limitTime: number): void {
		for (const [ip, times] of messageTimesByIp) {
			const recentTimes = times.filter((time) => time > limitTime);
			if (recentTimes.length === 0) messageTimesByIp.delete(ip);
			else messageTimesByIp.set(ip, recentTimes);
		}
	}

	/**
	 * Compte un message de cette IP et renvoie null ; au-delà de la limite, rien n'est compté et la réponse est le délai
	 * avant de pouvoir réessayer, en millisecondes
	 */
	function recordMessage(ip: string): number | null {
		const currentTime = now();
		forgetMessagesBefore(currentTime - HOUR_MS);

		const recentTimes = messageTimesByIp.get(ip) ?? [];
		const [oldestTime] = recentTimes;
		if (oldestTime !== undefined && recentTimes.length >= hourlyLimitPerIp)
			return oldestTime + HOUR_MS - currentTime;

		messageTimesByIp.set(ip, [...recentTimes, currentTime]);
		return null;
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
