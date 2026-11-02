import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { ForbiddenError } from "../../../error/ForbiddenError.ts";
import { logError } from "../../../error/logError.ts";
import type { Mail } from "../../../mail/mail.type.ts";
import { mailService } from "../../../mail/mailService.ts";

class AuthMailService {
	/**
	 * Les parcours qui envoient un mail (connexion par mail, mot de passe oublié, changement d'email, facteur mail)
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
