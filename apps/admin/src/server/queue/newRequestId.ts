import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";

// L'identifiant d'une demande : la date d'abord, pour que l'ordre des noms soit celui des
// demandes (infra-ops garde les plus récentes), puis du hasard, en hexadécimal : infra-ops
// n'accepte que lettres, chiffres et « - »
export function newRequestId(): string {
	return `${Date.now()}-${createRandomToken(4, "hex")}`;
}
