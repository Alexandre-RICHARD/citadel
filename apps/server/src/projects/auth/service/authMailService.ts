import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { authSettings } from "../../../configuration/authSettings.ts";
import { ForbiddenError } from "../../../error/ForbiddenError.ts";
import { logError } from "../../../error/logError.ts";
import type { Mail } from "../../../mail/mail.type.ts";
import { mailService } from "../../../mail/mailService.ts";
import type { MailStatusBean } from "../../../mail/quota/mailStatusBean.type.ts";

class AuthMailService {
	// L'état des emails tel que le site l'annonce (GET /mail/status) : l'interrupteur d'urgence ferme aussi les inscriptions
	async getStatus(): Promise<MailStatusBean> {
		const status = await mailService.getStatus();
		return {
			...status,
			isRegistrationOpen:
				status.isRegistrationOpen && authSettings.isRegistrationEnabled,
		};
	}

	// Les inscriptions s'arrêtent avant le reste des emails : leur seuil du quota est plus bas
	async assertRegistrationOpen(): Promise<void> {
		const { isRegistrationOpen } = await this.getStatus();
		if (!isRegistrationOpen)
			throw new ForbiddenError(
				AuthErrorCodeEnum.REGISTRATION_CLOSED,
				"Registrations are closed for today",
			);
	}

	/**
	 * Les parcours qui envoient un email (connexion par email, mot de passe oublié, changement d'email, facteur email)
	 * s'arrêtent quand le quota du jour est épuisé, pour tout le monde : la réponse ne dépend donc pas du compte.
	 * L'inscription a son propre seuil (`REGISTRATION_CLOSED`), plus bas
	 */
	async assertSendingOpen(): Promise<void> {
		const { isSendingOpen } = await mailService.getStatus();
		if (!isSendingOpen)
			throw new ForbiddenError(
				AuthErrorCodeEnum.MAIL_CLOSED,
				"The daily mail quota closed the mails of the authentication",
			);
	}

	/**
	 * Lance l'envoi d'une réponse neutre sans l'attendre : ni la durée ni un échec ne disent si le compte existe.
	 * L'échec est enregistré dans mailing_failure par `mailService`, puis loggé ici sans adresse : le visiteur ne le voit
	 * jamais
	 */
	sendWithoutWaiting(mail: Mail): void {
		mailService.send(mail).catch(async (error: unknown) => {
			await logError(error, `Mail d'authentification ${mail.kind}`);
		});
	}
}

export const authMailService = new AuthMailService();
