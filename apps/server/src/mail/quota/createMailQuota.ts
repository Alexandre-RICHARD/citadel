import { getParisDay } from "@citadel/common/src/universal/date/getParisDay.ts";

import type { MailQuotaLimits } from "./mailQuotaLimits.type.ts";
import type { MailStatusBean } from "./mailStatusBean.type.ts";
import { MailThresholdEnum } from "./mailThreshold.enum.ts";

// Le dernier email du jour est gardé pour l'alerte de fermeture totale
const ALERT_RESERVE = 1;

type Options = {
	limits: MailQuotaLimits;
	// Le compteur du fournisseur est relu au plus une fois par cette durée
	readingLifetimeMs: number;
	// Emails envoyés aujourd'hui selon le fournisseur ; null sans compteur (journal, tests) : le serveur compte seul
	readSentToday: () => Promise<number | null>;
	// Au premier franchissement de chaque seuil du jour, une seule fois
	onThresholdCrossed: (threshold: MailThresholdEnum, sentToday: number) => void;
	// Le compteur du fournisseur ne répond plus : appelé une fois, puis de nouveau après un retour
	onReadFailed: (error: unknown) => void;
	now?: () => number;
};

type Reading = {
	day: string;
	sent: number;
	readAt: number;
};

/**
 * Le quota quotidien du fournisseur : combien d'emails sont partis aujourd'hui, et donc ce qui reste ouvert.
 * Le décompte vient du fournisseur (il inclut les réponses envoyées depuis Gmail et survit aux déploiements), relu au
 * plus une fois par minute ; entre deux relevés, et si le fournisseur ne répond pas, le serveur ajoute ses propres envois
 */
export function createMailQuota({
	limits,
	readingLifetimeMs,
	readSentToday,
	onThresholdCrossed,
	onReadFailed,
	now = Date.now,
}: Options) {
	const sendingStop = limits.dailyLimit - ALERT_RESERVE;
	const thresholds: [MailThresholdEnum, number][] = [
		[MailThresholdEnum.REGISTRATION, limits.registrationStop],
		[MailThresholdEnum.CONTACT, limits.contactStop],
		[MailThresholdEnum.DAILY, sendingStop],
	];

	let reading: Reading | null = null;
	// Envois du serveur depuis le dernier relevé
	let sentSinceReading = 0;
	let pendingRefresh: Promise<void> | null = null;
	let isReadFailing = false;
	// Seuils déjà signalés, pour le jour `alertDay`
	let alertedThresholds = new Set<MailThresholdEnum>();
	let alertDay = "";

	function today(): string {
		return getParisDay(now());
	}

	function countSent(): number {
		return (reading?.sent ?? 0) + sentSinceReading;
	}

	function isReadingStale(): boolean {
		if (reading?.day !== today()) return true;
		return now() - reading.readAt >= readingLifetimeMs;
	}

	function startReading(sent: number, readAt: number): void {
		reading = { day: today(), sent, readAt };
		sentSinceReading = 0;
	}

	function notifyCrossedThresholds(): void {
		const day = today();
		if (alertDay !== day) {
			alertDay = day;
			alertedThresholds = new Set();
		}

		const sentToday = countSent();
		for (const [threshold, stop] of thresholds)
			if (sentToday >= stop && !alertedThresholds.has(threshold)) {
				alertedThresholds.add(threshold);
				onThresholdCrossed(threshold, sentToday);
			}
	}

	async function readProvider(): Promise<void> {
		const sent = await readSentToday().then(
			(value) => {
				isReadFailing = false;
				return value;
			},
			(error: unknown) => {
				if (!isReadFailing) onReadFailed(error);
				isReadFailing = true;
				return null;
			},
		);

		if (sent !== null) startReading(sent, now());
		// Pas de nouveau relevé : l'ancien, plus les envois du serveur depuis ; nouvel essai dans une minute
		else if (reading?.day === today()) reading.readAt = now();
		// Nouveau jour sans relevé : le serveur repart de zéro
		else startReading(0, now());
		notifyCrossedThresholds();
	}

	// Des appels simultanés partagent le même relevé
	async function refresh(): Promise<void> {
		pendingRefresh ??= readProvider().finally(() => {
			pendingRefresh = null;
		});
		return pendingRefresh;
	}

	async function getSentToday(): Promise<number> {
		if (isReadingStale()) await refresh();
		return countSent();
	}

	async function getStatus(): Promise<MailStatusBean> {
		const sentToday = await getSentToday();
		return {
			isRegistrationOpen: sentToday < limits.registrationStop,
			isContactOpen: sentToday < limits.contactStop,
			isSendingOpen: sentToday < sendingStop,
		};
	}

	// Un email vient de partir. Premier envoi d'un nouveau jour : un relevé local, à relire au prochain appel
	function recordSend(): void {
		if (reading?.day !== today()) startReading(0, -Infinity);
		sentSinceReading += 1;
		notifyCrossedThresholds();
	}

	return { getSentToday, getStatus, recordSend };
}
