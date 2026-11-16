import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import { mediaSurveySchema } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurveySchema.ts";

import { ServiceUnavailableError } from "../../../../error/ServiceUnavailableError.ts";

// Le job repasse chaque nuit : réessayer après une minute suffit (relancé depuis la console)
const RETRY_AFTER_MS = 60_000;

// Le dernier relevé lu, gardé tant que le fichier n'a pas changé : plusieurs Mo de JSON à chaque page, sinon
let cached: { stamp: string; survey: MediaSurvey } | null = null;

function unavailable(reason: string, cause?: unknown): ServiceUnavailableError {
	return Object.assign(
		new ServiceUnavailableError(
			BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE,
			`Media survey unavailable : ${reason}`,
			RETRY_AFTER_MS,
		),
		{ cause },
	);
}

/**
 * Le dernier relevé du job (survey/current.json), vérifié par son schéma. Absent, illisible ou d'une autre version du
 * format : 503, que le tableau affiche, plutôt que des colonnes du NAS fausses
 */
export async function readMediaSurvey(stateDir: string): Promise<MediaSurvey> {
	const filePath = path.join(stateDir, MediaStatePathEnum.CURRENT_SURVEY);
	let stamp: string;
	try {
		const { mtimeMs, size } = await stat(filePath);
		stamp = `${mtimeMs}:${size}`;
	} catch (error) {
		throw unavailable("no survey file", error);
	}
	if (cached?.stamp === stamp) return cached.survey;

	let content: unknown;
	try {
		content = JSON.parse(await readFile(filePath, "utf8"));
	} catch (error) {
		throw unavailable("unreadable survey file", error);
	}
	const parsed = mediaSurveySchema.safeParse(content);
	if (!parsed.success) throw unavailable("survey file out of format");
	cached = { stamp, survey: parsed.data };
	return parsed.data;
}
