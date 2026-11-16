import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import type { SurveyedMovie } from "@citadel/specs/src/projects/backlog/mediaState/surveyedMovie.type.ts";
import type { SurveyedShow } from "@citadel/specs/src/projects/backlog/mediaState/surveyedShow.type.ts";

import { requireTestStateDir } from "./requireTestStateDir.ts";
import { TEST_SURVEYED_AT } from "./testSurveyedAt.ts";

/**
 * Le relevé du job pour ce test, à la place du précédent ; les cases « Vérifié » repartent de zéro, sauf pour rejouer
 * un passage du job sur les mêmes cases (keepVerifications). Les tests sont
 * séquentiels : chacun écrit le sien avant d'appeler l'API
 */
export function writeTestSurvey(
	{
		movies = [],
		shows = [],
		unlinked = [],
	}: {
		movies?: SurveyedMovie[];
		shows?: SurveyedShow[];
		unlinked?: MediaSurvey["unlinked"];
	},
	{ keepVerifications = false }: { keepVerifications?: boolean } = {},
): void {
	const stateDir = requireTestStateDir();
	const survey: MediaSurvey = {
		formatVersion: 1,
		surveyedAt: TEST_SURVEYED_AT,
		jellyfinServerId: "server-1",
		movies,
		shows,
		unlinked,
	};
	writeFileSync(
		path.join(stateDir, MediaStatePathEnum.CURRENT_SURVEY),
		JSON.stringify(survey),
	);
	if (!keepVerifications)
		rmSync(path.join(stateDir, MediaStatePathEnum.VERIFICATIONS), {
			force: true,
		});
}
