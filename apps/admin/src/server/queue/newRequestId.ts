import { randomBytes } from "node:crypto";

// L'identifiant d'une demande : la date d'abord, pour que l'ordre des noms soit celui des
// demandes (infra-ops garde les plus récentes), puis du hasard
export function newRequestId(): string {
	return `${Date.now()}-${randomBytes(4).toString("hex")}`;
}
