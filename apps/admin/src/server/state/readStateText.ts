import { readFile } from "node:fs/promises";

import { env } from "../configuration/env.ts";

// Un fichier de state/, écrit par citadel ou infra-ops. Absent (aucun passage encore,
// ou ton PC) : null, sans erreur.
export async function readStateText(fileName: string): Promise<string | null> {
	try {
		return await readFile(`${env.STATE_DIR}/${fileName}`, "utf8");
	} catch {
		return null;
	}
}
