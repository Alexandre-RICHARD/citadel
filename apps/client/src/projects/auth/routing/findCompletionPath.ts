import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";

import { AuthPathEnum } from "./authPath.enum";

/**
 * Où mène un parcours qui vient de se terminer : une inscription propose de protéger le compte, les parcours du profil
 * y reviennent, les autres (connexion, mot de passe oublié) renvoient à la page demandée au départ. `kind` absent : le
 * parcours n'était pas connu de cette page
 */
export function findCompletionPath(
	kind: FlowKindEnum | undefined,
	redirectPath: string,
): string {
	switch (kind) {
		case FlowKindEnum.REGISTRATION:
			return AuthPathEnum.SECURE_ACCOUNT;
		case FlowKindEnum.EMAIL_CHANGE:
		case FlowKindEnum.EMAIL_FACTOR:
			return AuthPathEnum.PROFILE;
		default:
			return redirectPath;
	}
}
