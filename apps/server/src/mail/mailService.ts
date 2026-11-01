import { env } from "../configuration/env.ts";
import { logError } from "../error/logError.ts";
import { activeBrevoClient } from "./brevo/activeBrevoClient.ts";
import type { Mail } from "./mail.type.ts";
import { createMailQuota } from "./quota/createMailQuota.ts";
import type { MailQuotaLimits } from "./quota/mailQuotaLimits.type.ts";
import type { MailStatusBean } from "./quota/mailStatusBean.type.ts";
import type { MailThresholdEnum } from "./quota/mailThreshold.enum.ts";
import { mailSender } from "./sender/mailSender.ts";
import { buildQuotaAlertMail } from "./template/buildQuotaAlertMail.ts";

const limits: MailQuotaLimits = {
	registrationStop: env.MAIL_REGISTRATION_STOP,
	contactStop: env.MAIL_CONTACT_STOP,
	dailyLimit: env.MAIL_DAILY_LIMIT,
};

/**
 * Tout mail du site passe ici : l'expéditeur choisi par MAIL_SENDER l'envoie, et le quota du jour le compte.
 * Avant d'envoyer, l'appelant vérifie que `getStatus` laisse sa fonction ouverte
 */
class MailService {
	readonly #quota = createMailQuota({
		limits,
		readSentToday: async () => activeBrevoClient?.getSentToday() ?? null,
		onThresholdCrossed: (threshold, sentToday) => {
			this.#sendQuotaAlert(threshold, sentToday);
		},
		onReadFailed: (error) => {
			void logError(error, "Lecture du quota de Brevo");
		},
	});

	async send(mail: Mail): Promise<void> {
		await mailSender.send(mail);
		this.#quota.recordSend();
	}

	async getStatus(): Promise<MailStatusBean> {
		return this.#quota.getStatus();
	}

	// Lancée sans être attendue : l'alerte ne retarde pas la réponse au visiteur, et son échec n'est que loggé
	#sendQuotaAlert(threshold: MailThresholdEnum, sentToday: number): void {
		this.send(buildQuotaAlertMail(threshold, sentToday, limits)).catch(
			async (error: unknown) => logError(error, `Alerte de quota ${threshold}`),
		);
	}
}

export const mailService = new MailService();
