import { readFile } from "node:fs/promises";
import path from "node:path";

import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import type { MediaVerifications } from "@citadel/specs/src/projects/backlog/mediaState/mediaVerifications.type.ts";
import { mediaVerificationsSchema } from "@citadel/specs/src/projects/backlog/mediaState/mediaVerificationsSchema.ts";

import { emptyMediaVerifications } from "./emptyMediaVerifications.ts";

const NOT_FOUND = "ENOENT";

/**
 * Les cases « Vérifié » (verified/verified.json). Pas encore de fichier : aucune case. Un fichier illisible est une
 * erreur : l'écraser perdrait toutes les cases
 */
export async function readMediaVerifications(
	stateDir: string,
): Promise<MediaVerifications> {
	let content: string;
	try {
		content = await readFile(
			path.join(stateDir, MediaStatePathEnum.VERIFICATIONS),
			"utf8",
		);
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === NOT_FOUND)
			return emptyMediaVerifications();
		throw error;
	}
	return mediaVerificationsSchema.parse(JSON.parse(content));
}
