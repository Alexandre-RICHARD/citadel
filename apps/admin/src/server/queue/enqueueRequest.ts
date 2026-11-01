import { rename, writeFile } from "node:fs/promises";

import { env } from "../configuration/env.ts";
import { writeAuditLog } from "../http/writeAuditLog.ts";
import { newRequestId } from "./newRequestId.ts";

// Dépose une demande pour infra-ops, qui la vérifie avant de
// l'exécuter : la console ne fait rien d'autre qu'écrire ce fichier. Écrit à côté puis
// renommé : infra-ops ne lit jamais une demande à moitié écrite.
export async function enqueueRequest(
	request: Record<string, string> & { action: string },
	ip: string | undefined,
): Promise<string> {
	const id = newRequestId();
	const path = `${env.QUEUE_DIR}/${id}.json`;
	await writeFile(`${path}.tmp`, JSON.stringify(request), { mode: 0o644 });
	await rename(`${path}.tmp`, path);
	writeAuditLog({ event: "request", id, ...request, ip });
	return id;
}
