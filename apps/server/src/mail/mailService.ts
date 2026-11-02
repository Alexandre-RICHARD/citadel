import { env } from "../configuration/env.ts";
import { logError } from "../error/logError.ts";
import { activeBrevoClient } from "./brevo/activeBrevoClient.ts";
import { createMailFailureQuery } from "./failure/createMailFailureQuery.ts";
import type { MailFailureSummaryBean } from "./failure/mailFailureSummaryBean.type.ts";
import { summarizeMailFailuresQuery } from "./failure/summarizeMailFailuresQuery.ts";
import type { Mail } from "./mail.type.ts";
import { createMailQuota } from "./quota/createMailQuota.ts";
import type { MailQuotaLimits } from "./quota/mailQuotaLimits.type.ts";
import type { MailStatusBean } from "./quota/mailStatusBean.type.ts";
import type { MailThresholdEnum } from "./quota/mailThreshold.enum.ts";
import { mailSender } from "./sender/mailSender.ts";
import { buildQuotaAlertMail } from "./template/buildQuotaAlertMail.ts";

// La fenêtre de l'alerte de la console : un échec y reste visible une semaine
const FAILURE_WINDOW_DAYS = 7;

const limits: MailQuotaLimits = {
	registrationStop: env.MAIL_REGISTRATION_STOP,
	contactStop: env.MAIL_CONTACT_STOP,
	dailyLimit: env.MAIL_DAILY_LIMIT,
};

/**
 * Tout mail du site passe ici : l'expéditeur choisi par MAIL_SENDER l'envoie, et le quota du jour le compte. Un envoi
 * qui échoue est enregistré en base (mail_failure), puis son erreur repart vers l'appelant.
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

	// `isFailureRecorded: false` : la relance du soir des messages de contact, dont un échec n'ajoute rien à mail_failure
	async send(
		mail: Mail,
		{ isFailureRecorded = true }: { isFailureRecorded?: boolean } = {},
	): Promise<void> {
		try {
			await mailSender.send(mail);
		} catch (error) {
			if (isFailureRecorded) await this.#recordFailure(mail, error);
			throw error;
		}
		this.#quota.recordSend();
	}

	async getStatus(): Promise<MailStatusBean> {
		return this.#quota.getStatus();
	}

	async getFailureSummary(): Promise<MailFailureSummaryBean> {
		return summarizeMailFailuresQuery(FAILURE_WINDOW_DAYS, new Date());
	}

	// Ni adresse ni contenu : le type du mail et le message de l'erreur, que le client de Brevo écrit sans eux. Un
	// enregistrement raté est loggé, sans masquer l'erreur d'envoi
	async #recordFailure(mail: Mail, error: unknown): Promise<void> {
		const reason = error instanceof Error ? error.message : String(error);
		try {
			await createMailFailureQuery(mail.kind, reason, new Date());
		} catch (recordError) {
			await logError(
				recordError,
				`Enregistrement de l'échec du mail ${mail.kind}`,
			);
		}
	}

	// Lancée sans être attendue : l'alerte ne retarde pas la réponse au visiteur, et son échec n'est que loggé
	#sendQuotaAlert(threshold: MailThresholdEnum, sentToday: number): void {
		this.send(buildQuotaAlertMail(threshold, sentToday, limits)).catch(
			async (error: unknown) => logError(error, `Alerte de quota ${threshold}`),
		);
	}
}

export const mailService = new MailService();
