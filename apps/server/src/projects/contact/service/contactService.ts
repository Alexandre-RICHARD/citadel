import { ContactAcknowledgementEnum } from "@citadel/specs/src/projects/contact/contactAcknowledgement.enum.ts";
import { ContactRetryStopEnum } from "@citadel/specs/src/projects/contact/contactRetryStop.enum.ts";
import { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum.ts";

import { env } from "../../../configuration/env.ts";
import { ForbiddenError } from "../../../error/ForbiddenError.ts";
import { logError } from "../../../error/logError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import { mailService } from "../../../mail/mailService.ts";
import type { ContactMessageBean } from "../bean/contactMessageBean.type.ts";
import type { ContactMessageUnsentBean } from "../bean/contactMessageUnsentBean.type.ts";
import type { ContactUnsentRetryBean } from "../bean/contactUnsentRetryBean.type.ts";
import { createContactLimiter } from "../limit/createContactLimiter.ts";
import { fromContactMessageUnsentEntityToContactMessageUnsentBean } from "../mapper/beanEntity/contactMessageUnsent/fromContactMessageUnsentEntityToContactMessageUnsentBean.ts";
import { countContactMessagesUnsentQuery } from "../query/countContactMessagesUnsentQuery.ts";
import { createContactMessageUnsentQuery } from "../query/createContactMessageUnsentQuery.ts";
import { deleteContactMessageUnsentQuery } from "../query/deleteContactMessageUnsentQuery.ts";
import { findContactMessagesUnsentQuery } from "../query/findContactMessagesUnsentQuery.ts";
import { buildContactAcknowledgementMail } from "../template/buildContactAcknowledgementMail.ts";
import { buildContactNotificationMail } from "../template/buildContactNotificationMail.ts";

class ContactService {
	readonly #limiter = createContactLimiter(env.CONTACT_HOURLY_LIMIT_PER_IP);

	// Le message est arrivé ; la réponse dit ce qu'il est advenu de l'accusé de réception
	async sendMessage(
		contactMessage: ContactMessageBean,
	): Promise<ContactAcknowledgementEnum> {
		// Un robot reçoit la réponse d'un message sans adresse
		if (contactMessage.isHoneypotFilled)
			return ContactAcknowledgementEnum.NO_EMAIL;

		const { isContactOpen } = await mailService.getStatus();
		if (!isContactOpen)
			throw new ForbiddenError(
				ContactErrorCodeEnum.CONTACT_CLOSED,
				"The daily mail quota closed the contact form",
			);

		const retryAfterMs = this.#limiter.recordMessage(contactMessage.ip);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Too many contact messages from this IP",
				retryAfterMs,
			);

		await this.#notify(contactMessage);

		const { email, subject } = contactMessage;
		if (email === null) return ContactAcknowledgementEnum.NO_EMAIL;
		if (!this.#limiter.claimAcknowledgement(email))
			return ContactAcknowledgementEnum.ALREADY_SENT_TODAY;
		return this.#sendAcknowledgement(email, subject);
	}

	// Notification qui ne part pas : le message complet est gardé en base, et le visiteur n'a rien à refaire. Si la base
	// échoue aussi, rien n'est gardé : l'erreur d'envoi repart vers le visiteur, qui garde son texte
	async #notify(contactMessage: ContactMessageBean): Promise<void> {
		try {
			await mailService.send(
				buildContactNotificationMail(contactMessage, new Date()),
			);
		} catch (sendError) {
			try {
				await createContactMessageUnsentQuery(contactMessage);
			} catch (keepError) {
				await logError(
					keepError,
					"Conservation du message de contact non envoyé",
				);
				throw sendError;
			}
		}
	}

	async countUnsentMessages(): Promise<number> {
		return countContactMessagesUnsentQuery();
	}

	/**
	 * La relance du soir : renvoie, du plus ancien au plus récent, les messages gardés en base, tant que le quota laisse
	 * le contact ouvert. Pour chacun, la notification d'origine (la date où le visiteur a écrit, sujet suivi de
	 * « (différé) »), puis l'accusé de réception avec la mention du retard : on ne sait pas s'il était parti. Une
	 * notification partie supprime la ligne. Un refus du fournisseur arrête tout, inutile d'insister ce soir-là. Aucun
	 * échec n'est ajouté à mail_failure : ces messages y figurent déjà. Le job qui l'appelle tient le verrou
	 * d'infra-ops : deux relances ne tournent jamais ensemble
	 */
	async retryUnsentMessages(): Promise<ContactUnsentRetryBean> {
		const unsentMessages = (await findContactMessagesUnsentQuery()).map(
			fromContactMessageUnsentEntityToContactMessageUnsentBean,
		);
		// Un seul accusé par adresse et par relance, même pour plusieurs messages
		const acknowledgedEmails = new Set<string>();
		let sentCount = 0;
		let stoppedBecause: ContactRetryStopEnum | null = null;

		for (const unsentMessage of unsentMessages) {
			// eslint-disable-next-line no-await-in-loop
			const { isContactOpen } = await mailService.getStatus();
			if (!isContactOpen) {
				stoppedBecause = ContactRetryStopEnum.QUOTA_REACHED;
				break;
			}
			// eslint-disable-next-line no-await-in-loop
			if (!(await this.#resendNotification(unsentMessage))) {
				stoppedBecause = ContactRetryStopEnum.SEND_FAILED;
				break;
			}
			sentCount += 1;
			// eslint-disable-next-line no-await-in-loop
			await deleteContactMessageUnsentQuery(unsentMessage.id);

			const { email, subject } = unsentMessage;
			if (email !== null && !acknowledgedEmails.has(email.toLowerCase())) {
				acknowledgedEmails.add(email.toLowerCase());
				// eslint-disable-next-line no-await-in-loop
				await this.#resendAcknowledgement(email, subject);
			}
		}

		return {
			sentCount,
			remainingCount: unsentMessages.length - sentCount,
			stoppedBecause,
		};
	}

	// true : la notification est partie. Un refus est loggé (le job qui appelle le voit dans son bilan)
	async #resendNotification(
		unsentMessage: ContactMessageUnsentBean,
	): Promise<boolean> {
		try {
			await mailService.send(
				buildContactNotificationMail(unsentMessage, unsentMessage.createdAt, {
					isDelayed: true,
				}),
				{ isFailureRecorded: false },
			);
			return true;
		} catch (error) {
			await logError(error, "Relance d'un message de contact non envoyé");
			return false;
		}
	}

	// Le message est arrivé : un accusé qui échoue n'est que loggé
	async #resendAcknowledgement(email: string, subject: string): Promise<void> {
		try {
			await mailService.send(
				buildContactAcknowledgementMail(email, subject, { isDelayed: true }),
				{ isFailureRecorded: false },
			);
		} catch (error) {
			await logError(error, "Relance de l'accusé de réception du contact");
		}
	}

	// Le message est arrivé : un accusé qui échoue est loggé, sans son adresse ni son sujet, et le visiteur le sait
	async #sendAcknowledgement(
		email: string,
		subject: string,
	): Promise<ContactAcknowledgementEnum> {
		try {
			await mailService.send(buildContactAcknowledgementMail(email, subject));
			return ContactAcknowledgementEnum.SENT;
		} catch (error) {
			await logError(error, "Accusé de réception du formulaire de contact");
			return ContactAcknowledgementEnum.FAILED;
		}
	}
}

export const contactService = new ContactService();
