import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";

import type { Mail } from "../../../mail/mail.type.ts";
import type { FlowSecretsBean } from "../bean/flowSecretsBean.type.ts";
import { findUserByEmailQuery } from "../query/user/findUserByEmailQuery.ts";
import { buildEmailChangeMail } from "../template/buildEmailChangeMail.ts";
import { buildEmailFactorActivationMail } from "../template/buildEmailFactorActivationMail.ts";
import { buildExistingAccountMail } from "../template/buildExistingAccountMail.ts";
import { buildMailLoginMail } from "../template/buildMailLoginMail.ts";
import { buildPasswordResetMail } from "../template/buildPasswordResetMail.ts";
import { buildRegistrationMail } from "../template/buildRegistrationMail.ts";
import { buildVerifyLinkUrl } from "../template/buildVerifyLinkUrl.ts";
import type { VerificationMailParameters } from "../template/verificationMailParameters.type.ts";
import { authMailService } from "./authMailService.ts";

type FlowFacts = {
	kind: FlowKindEnum;
	userId: number | null;
	email: string;
};

// Ce que reçoit la boîte d'un parcours à son étape « lien et code »
type StepMail =
	// Le lien et le code : le parcours a besoin de secrets
	| { hasSecrets: true }
	// Une inscription à une adresse déjà inscrite : un avertissement, sans rien à confirmer
	| { hasSecrets: false; existingAccountLastLoginAt: Date }
	// Un leurre : rien ne part
	| { hasSecrets: false; existingAccountLastLoginAt: null };

const VERIFICATION_MAIL_BUILDERS: Partial<
	Record<FlowKindEnum, (parameters: VerificationMailParameters) => Mail>
> = {
	[FlowKindEnum.REGISTRATION]: buildRegistrationMail,
	[FlowKindEnum.MAIL_LOGIN]: buildMailLoginMail,
	[FlowKindEnum.PASSWORD_RESET]: buildPasswordResetMail,
	[FlowKindEnum.EMAIL_CHANGE]: buildEmailChangeMail,
	[FlowKindEnum.EMAIL_FACTOR]: buildEmailFactorActivationMail,
};

class FlowMailService {
	// Les inscriptions ont leur seuil, plus bas que celui des autres mails
	async assertOpen(kind: FlowKindEnum): Promise<void> {
		if (kind === FlowKindEnum.REGISTRATION)
			await authMailService.assertRegistrationOpen();
		else await authMailService.assertSendingOpen();
	}

	// Décidé à chaque envoi : une adresse peut avoir été inscrite entre un mail et son renvoi
	async plan({ kind, userId, email }: FlowFacts): Promise<StepMail> {
		if (kind !== FlowKindEnum.REGISTRATION)
			return userId === null
				? { hasSecrets: false, existingAccountLastLoginAt: null }
				: { hasSecrets: true };

		const existingUser = await findUserByEmailQuery(email);
		return existingUser === null
			? { hasSecrets: true }
			: {
					hasSecrets: false,
					existingAccountLastLoginAt:
						existingUser.lastLoginAt ?? existingUser.createdAt,
				};
	}

	// Part après la réponse, sans être attendu
	send(
		stepMail: StepMail,
		{ kind, email }: FlowFacts,
		secrets: FlowSecretsBean | null,
		validityMinutes: number,
	): void {
		const mail = this.#build(stepMail, kind, email, secrets, validityMinutes);
		if (mail !== null) authMailService.sendWithoutWaiting(mail);
	}

	#build(
		stepMail: StepMail,
		kind: FlowKindEnum,
		email: string,
		secrets: FlowSecretsBean | null,
		validityMinutes: number,
	): Mail | null {
		if (!stepMail.hasSecrets)
			return stepMail.existingAccountLastLoginAt === null
				? null
				: buildExistingAccountMail(
						email,
						stepMail.existingAccountLastLoginAt,
						new Date(),
					);

		const buildMail = VERIFICATION_MAIL_BUILDERS[kind];
		if (buildMail === undefined || secrets === null)
			throw new Error(`No mail with a link and a code for a ${kind} flow`);
		return buildMail({
			email,
			linkUrl: buildVerifyLinkUrl(secrets.linkToken),
			code: secrets.code,
			validityMinutes,
		});
	}
}

export const flowMailService = new FlowMailService();
