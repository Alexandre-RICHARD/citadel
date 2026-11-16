import { readFile } from "node:fs/promises";

import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";
import { mediaSyncReportSchema } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReportSchema.ts";

// Le rapport du passage d'avant, pour la comparaison ; null s'il manque, se lit mal ou vient d'une autre version
export async function readPreviousReport(
	reportPath: string,
): Promise<MediaSyncReport | null> {
	try {
		const parsed = mediaSyncReportSchema.safeParse(
			JSON.parse(await readFile(reportPath, "utf8")),
		);
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}
