import { rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import type { MediaVerifications } from "@citadel/specs/src/projects/backlog/mediaState/mediaVerifications.type.ts";

/**
 * La seule écriture du backlog sur le NAS. Écrit à côté puis renommé : une coupure au milieu laisse l'ancien fichier
 * entier, jamais un JSON tronqué. Les deux fichiers sont dans verified/, le seul dossier monté en écriture
 */
export async function writeMediaVerifications(
	stateDir: string,
	verifications: MediaVerifications,
): Promise<void> {
	const filePath = path.join(stateDir, MediaStatePathEnum.VERIFICATIONS);
	const temporaryPath = `${filePath}.${process.pid}.tmp`;
	await writeFile(
		temporaryPath,
		`${JSON.stringify(verifications, null, "\t")}\n`,
	);
	await rename(temporaryPath, filePath);
}
