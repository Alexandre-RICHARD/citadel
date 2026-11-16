import { copyFile } from "node:fs/promises";
import path from "node:path";

import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import { mediaSurveySchema } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurveySchema.ts";

import { writeJsonAtomically } from "./writeJsonAtomically.ts";

/**
 * Le relevé du passage dans media-state (survey/current.json), l'ancien gardé comme relevé précédent, et rien de plus
 * ancien. Vérifié par son schéma avant d'être écrit : un relevé hors format laisserait l'instance locale sans colonnes
 * du NAS. Le job n'écrit jamais dans verified/, celui de l'instance locale
 */
export async function writeSurvey(
	mediaStateDir: string,
	survey: MediaSurvey,
): Promise<void> {
	const checked = mediaSurveySchema.parse(survey);
	const currentPath = path.join(
		mediaStateDir,
		MediaStatePathEnum.CURRENT_SURVEY,
	);
	try {
		await copyFile(
			currentPath,
			path.join(mediaStateDir, MediaStatePathEnum.PREVIOUS_SURVEY),
		);
	} catch (error) {
		// Premier passage : pas encore de relevé à garder
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
	}
	await writeJsonAtomically(currentPath, checked);
}
