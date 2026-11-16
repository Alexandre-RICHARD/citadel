import { createPasswordHasher } from "@citadel/common/src/node/password/createPasswordHasher.ts";
import { OWASP_ARGON2_PARAMETERS } from "@citadel/common/src/node/password/owaspArgon2Parameters.ts";

// Une vérification à la fois, 4 en attente au plus, comme la console : un seul compte s'en sert
export const mediaPasswordHasher = createPasswordHasher({
	parameters: OWASP_ARGON2_PARAMETERS,
	concurrency: 1,
	queueMax: 4,
});
