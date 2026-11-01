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

	async sendMessage(contactMessage: ContactMessageBean): Promise<void> {
		if (contactMessage.isHoneypotFilled) return;

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
		if (email !== null && this.#limiter.claimAcknowledgement(email))
			await this.#sendAcknowledgement(email, subject);
	}

	// Le message est arrivé : un accusé qui échoue n'est que loggé, sans son adresse ni son sujet
	async #sendAcknowledgement(email: string, subject: string): Promise<void> {
		try {
			await mailService.send(buildContactAcknowledgementMail(email, subject));
		} catch (error) {
			await logError(error, "Accusé de réception du formulaire de contact");
		}
	}
}

export const contactService = new ContactService();
