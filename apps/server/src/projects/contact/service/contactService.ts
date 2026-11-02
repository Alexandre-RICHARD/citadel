import { ContactAcknowledgementEnum } from "@citadel/specs/src/projects/contact/contactAcknowledgement.enum.ts";
import { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum.ts";

import { env } from "../../../configuration/env.ts";
import { ForbiddenError } from "../../../error/ForbiddenError.ts";
import { logError } from "../../../error/logError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import { mailService } from "../../../mail/mailService.ts";
import type { ContactMessageBean } from "../bean/contactMessageBean.type.ts";
import { createContactLimiter } from "../limit/createContactLimiter.ts";
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

		// Son échec arrête tout : le visiteur voit l'erreur et garde son texte
		await mailService.send(
			buildContactNotificationMail(contactMessage, new Date()),
		);

		const { email, subject } = contactMessage;
		if (email === null) return ContactAcknowledgementEnum.NO_EMAIL;
		if (!this.#limiter.claimAcknowledgement(email))
			return ContactAcknowledgementEnum.ALREADY_SENT_TODAY;
		return this.#sendAcknowledgement(email, subject);
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
