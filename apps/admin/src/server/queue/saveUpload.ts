import { mkdir, rename, writeFile } from "node:fs/promises";

import { env } from "../configuration/env.ts";
import { newRequestId } from "./newRequestId.ts";

// Un dump envoyé depuis ton PC, déposé pour infra-ops (state/queue/uploads), qui le
// contrôle avant toute restauration. Renvoie son identifiant (« upload:<id> »).
export async function saveUpload(content: Buffer): Promise<string> {
	const id = newRequestId();
	const directory = `${env.QUEUE_DIR}/uploads`;
	await mkdir(directory, { recursive: true });
	const path = `${directory}/${id}.sql.zst`;
	await writeFile(`${path}.tmp`, content, { mode: 0o644 });
	await rename(`${path}.tmp`, path);
	return id;
}
