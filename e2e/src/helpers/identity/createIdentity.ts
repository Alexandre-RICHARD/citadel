import { randomBytes } from "node:crypto";

import { E2eCredentialsEnum } from "../../dictionaries/e2eCredentials.enum.ts";
import type { Identity } from "./identity.type.ts";

/**
 * Une identité neuve pour un test : la base n'est pas vidée entre les tests, alors chacun prend
 * un email et un pseudo que personne d'autre n'utilisera. `label` les rend reconnaissables
 * dans Mailpit et dans la base (alice-1a2b3c@e2e.test)
 */
export function createIdentity(label = "user"): Identity {
	const suffix = randomBytes(4).toString("hex");
	return {
		email: `${label}-${suffix}@e2e.test`,
		// Pseudo : lettres sans accent, chiffres, « _ » et « - », 64 caractères au plus
		username: `${label}_${suffix}`,
		password: E2eCredentialsEnum.VALID_PASSWORD,
	};
}
