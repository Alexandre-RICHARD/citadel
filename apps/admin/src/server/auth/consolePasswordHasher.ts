import { createPasswordHasher } from "@citadel/common/src/node/password/createPasswordHasher.ts";
import { OWASP_ARGON2_PARAMETERS } from "@citadel/common/src/node/password/owaspArgon2Parameters.ts";

// Une vérification à la fois (19 Mio chacune), 4 en attente au plus : une rafale de
// connexions ne bloque pas les autres travaux de Node (DNS, fichiers) de la console
export const consolePasswordHasher = createPasswordHasher({
	parameters: OWASP_ARGON2_PARAMETERS,
	concurrency: 1,
	queueMax: 4,
});
