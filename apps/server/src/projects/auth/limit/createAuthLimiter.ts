import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";
import { createBanList } from "@citadel/common/src/universal/limit/createBanList.ts";
import { createFailureCounter } from "@citadel/common/src/universal/limit/createFailureCounter.ts";
import { createSlidingWindowLimiter } from "@citadel/common/src/universal/limit/createSlidingWindowLimiter.ts";

import { groupIpForLimits } from "../../../common/network/groupIpForLimits.ts";
import type { AuthSettings } from "../../../configuration/authSettings.type.ts";

type Settings = Pick<
	AuthSettings,
	| "failures"
	| "mailLimits"
	| "registrationsPerIpPerHour"
	| "usernameChecksPerIpPerHour"
>;

type Attempt = {
	// Le compte trouvé (son id), pas le texte tapé : alterner email et pseudo ne double pas les essais. Sans compte trouvé,
	// le texte tapé en minuscules, pour qu'un identifiant inconnu réponde comme un compte (même délai, mêmes 429)
	accountKey: string;
	ip: string;
};

type MailRequest = {
	email: string;
	ip: string;
};

// Le plus long des délais d'attente ; null si aucun ne s'applique
function longestDelay(...delaysMs: (number | null)[]): number | null {
	const pendingDelaysMs = delaysMs.filter((delayMs) => delayMs !== null);
	return pendingDelaysMs.length === 0 ? null : Math.max(...pendingDelaysMs);
}

/**
 * Les limites de l'authentification, en mémoire (une seule instance du serveur, remises à zéro à chaque déploiement).
 * Chaque IP compte avec tout son /64 en IPv6. Rien n'est refusé ici : chaque fonction donne le délai d'attente, en
 * millisecondes (null : accepté), le service répond 429 avec Retry-After
 * - un essai raté (mot de passe ou second facteur) bloque le compte 2 s depuis cette IP ;
 * - 15 échecs du même compte depuis la même IP bannissent ce couple 15 minutes.
 * Délai et bannissement visent le couple compte + IP : un inconnu ne bloque jamais ton compte depuis chez toi ;
 * - 20 échecs d'une IP en 10 minutes, ou plus de 3 inscriptions en une heure, bannissent l'IP 15 minutes ;
 * - mails : 5 par heure par adresse ou identifiant tapé (sans casse, comme les messageries), 20 par heure et 40 par
 *   jour par IP ;
 * - disponibilité d'un pseudo : 60 questions par heure par IP
 */
export function createAuthLimiter(
	{
		failures,
		mailLimits,
		registrationsPerIpPerHour,
		usernameChecksPerIpPerHour,
	}: Settings,
	now: () => number = Date.now,
) {
	const pairDelays = createBanList({ now });
	const pairFailures = createFailureCounter({
		resetMs: failures.resetMs,
		now,
	});
	const pairBans = createBanList({ now });
	const ipFailures = createSlidingWindowLimiter({
		limit: failures.ipFailuresBeforeBan,
		windowMs: failures.ipWindowMs,
		now,
	});
	const ipBans = createBanList({ now });
	const registrationsPerIp = createSlidingWindowLimiter({
		limit: registrationsPerIpPerHour,
		windowMs: DurationMsEnum.HOUR,
		now,
	});
	const usernameChecksPerIp = createSlidingWindowLimiter({
		limit: usernameChecksPerIpPerHour,
		windowMs: DurationMsEnum.HOUR,
		now,
	});
	const mailsPerAddress = createSlidingWindowLimiter({
		limit: mailLimits.perAddressPerHour,
		windowMs: DurationMsEnum.HOUR,
		now,
	});
	const mailsPerIpPerHour = createSlidingWindowLimiter({
		limit: mailLimits.perIpPerHour,
		windowMs: DurationMsEnum.HOUR,
		now,
	});
	const mailsPerIpPerDay = createSlidingWindowLimiter({
		limit: mailLimits.perIpPerDay,
		windowMs: DurationMsEnum.DAY,
		now,
	});

	function pairKey({ accountKey, ip }: Attempt): string {
		return `${accountKey}|${groupIpForLimits(ip)}`;
	}

	function banIp(ipKey: string): void {
		ipBans.ban(ipKey, failures.ipBanMs);
	}

	// Avant de vérifier un mot de passe ou un second facteur
	function getAttemptRetryAfterMs(attempt: Attempt): number | null {
		return longestDelay(
			ipBans.getRemainingMs(groupIpForLimits(attempt.ip)),
			pairBans.getRemainingMs(pairKey(attempt)),
			pairDelays.getRemainingMs(pairKey(attempt)),
		);
	}

	function recordFailure(attempt: Attempt): void {
		const pair = pairKey(attempt);
		pairDelays.ban(pair, failures.delayMs);
		if (pairFailures.record(pair) >= failures.accountFailuresBeforeBan) {
			pairBans.ban(pair, failures.accountBanMs);
			pairFailures.reset(pair);
		}

		const ipKey = groupIpForLimits(attempt.ip);
		ipFailures.record(ipKey);
		// La fenêtre est pleine : cet échec était le dernier toléré
		if (ipFailures.getRetryAfterMs(ipKey) !== null) {
			banIp(ipKey);
			ipFailures.forget(ipKey);
		}
	}

	// Le compte et l'IP repartent de zéro ; les échecs de l'IP sur d'autres comptes restent comptés
	function recordSuccess(attempt: Attempt): void {
		pairFailures.reset(pairKey(attempt));
	}

	// Compte une inscription et renvoie null ; la suivante de trop bannit l'IP, et le délai est celui du bannissement
	function claimRegistration(ip: string): number | null {
		const ipKey = groupIpForLimits(ip);
		const banRemainingMs = ipBans.getRemainingMs(ipKey);
		if (banRemainingMs !== null) return banRemainingMs;

		if (registrationsPerIp.record(ipKey) === null) return null;
		banIp(ipKey);
		registrationsPerIp.forget(ipKey);
		return failures.ipBanMs;
	}

	// L'inscription comptée n'a pas abouti (serveur occupé, limite de mails) : elle ne compte pas
	function releaseRegistration(ip: string): void {
		registrationsPerIp.release(groupIpForLimits(ip));
	}

	// Compte une question et renvoie null ; au-delà de la limite, rien n'est compté et la réponse est le délai d'attente
	function claimUsernameCheck(ip: string): number | null {
		return usernameChecksPerIp.record(groupIpForLimits(ip));
	}

	// Compte un mail et renvoie null ; au-delà d'une limite, rien n'est compté et la réponse est le délai d'attente
	function claimMail({ email, ip }: MailRequest): number | null {
		const addressKey = email.toLowerCase();
		const ipKey = groupIpForLimits(ip);
		const retryAfterMs = longestDelay(
			mailsPerAddress.getRetryAfterMs(addressKey),
			mailsPerIpPerHour.getRetryAfterMs(ipKey),
			mailsPerIpPerDay.getRetryAfterMs(ipKey),
		);
		if (retryAfterMs !== null) return retryAfterMs;

		mailsPerAddress.record(addressKey);
		mailsPerIpPerHour.record(ipKey);
		mailsPerIpPerDay.record(ipKey);
		return null;
	}

	return {
		getAttemptRetryAfterMs,
		recordFailure,
		recordSuccess,
		claimRegistration,
		releaseRegistration,
		claimUsernameCheck,
		claimMail,
	};
}
