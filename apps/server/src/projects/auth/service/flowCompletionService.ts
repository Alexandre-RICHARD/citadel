import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";

import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import { factorService } from "./factorService.ts";
import { flowService } from "./flowService.ts";
import { loginService } from "./loginService.ts";
import { passwordResetService } from "./passwordResetService.ts";
import { registrationService } from "./registrationService.ts";
import { secondFactorService } from "./secondFactorService.ts";

type MailProof =
	{ kind: "code"; code: string } | { kind: "link"; linkToken: string };

/**
 * Le mail d'un parcours validé, par son code ou par son lien : la suite dépend du parcours. `replacingUsername` : pour
 * une inscription seulement, le pseudo qui remplace celui pris entre-temps
 */
class FlowCompletionService {
	async completeMailStep(
		proof: MailProof,
		browser: BrowserContextBean,
		replacingUsername: string | undefined,
	): Promise<FlowOutcomeBean> {
		const verified =
			proof.kind === "code"
				? await flowService.verifyCode(browser, proof.code)
				: await flowService.verifyLink(browser, proof.linkToken);

		switch (verified.flow.kind) {
			case FlowKindEnum.REGISTRATION:
				return registrationService.completeMailStep(
					verified,
					browser,
					replacingUsername,
				);
			case FlowKindEnum.MAIL_LOGIN:
				return loginService.completeMailStep(verified, browser);
			case FlowKindEnum.PASSWORD_RESET:
				return passwordResetService.completeMailStep(verified);
			case FlowKindEnum.EMAIL_FACTOR:
				return factorService.completeEmailFactorMailStep(verified, browser);
			// Le lien du code par email, à l'étape « second facteur » (le code, lui, se tape dans /flow/second-factor)
			case FlowKindEnum.LOGIN:
				return secondFactorService.completeMailLink(verified, browser);
			// Changement d'email : son service arrive avec le profil
			default:
				throw new Error(
					`No mail step to complete for a ${verified.flow.kind} flow`,
				);
		}
	}
}

export const flowCompletionService = new FlowCompletionService();
