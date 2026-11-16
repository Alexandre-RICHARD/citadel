import { rmSync } from "node:fs";
import path from "node:path";

import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";

import { requireTestStateDir } from "./requireTestStateDir.ts";

// Plus de relevé : le job n'est jamais passé
export function removeTestSurvey(): void {
	rmSync(path.join(requireTestStateDir(), MediaStatePathEnum.CURRENT_SURVEY), {
		force: true,
	});
}
