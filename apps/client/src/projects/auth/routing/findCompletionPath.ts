import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum";

import { AuthPathEnum } from "./authPath.enum";
import { buildProfilePath } from "./buildProfilePath";
import { ProfileCategoryEnum } from "./profileCategory.enum";

/**
 * Où mène un parcours qui vient de se terminer : une inscription propose de protéger le compte, les parcours du profil
 * reviennent à la catégorie d'où ils sont partis, les autres (connexion, mot de passe oublié) renvoient à la page
 * demandée au départ. `kind` absent : le parcours n'était pas connu de cette page
 */
export function findCompletionPath(
	kind: FlowKindEnum | undefined,
	redirectPath: string,
): string {
	switch (kind) {
		case FlowKindEnum.REGISTRATION:
			return AuthPathEnum.SECURE_ACCOUNT;
		case FlowKindEnum.EMAIL_CHANGE:
			return buildProfilePath(ProfileCategoryEnum.IDENTITY);
		case FlowKindEnum.EMAIL_FACTOR:
			return buildProfilePath(ProfileCategoryEnum.SECURITY);
		default:
			return redirectPath;
	}
}
