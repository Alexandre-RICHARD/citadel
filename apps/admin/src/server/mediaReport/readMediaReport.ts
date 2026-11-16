import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";
import { MEDIA_SYNC_REPORT_FILE } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReportFile.ts";
import { mediaSyncReportSchema } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReportSchema.ts";

import { readStateJson } from "../state/readStateJson.ts";

/**
 * Le rapport du dernier passage de media-sync (state/media-sync/report.json), vérifié par son schéma : un rapport
 * absent, abîmé ou d'une autre version du format ne s'affiche pas, plutôt que d'en mal lire les chiffres
 */
export async function readMediaReport(): Promise<MediaSyncReport | null> {
	const content = await readStateJson<unknown>(MEDIA_SYNC_REPORT_FILE);
	const parsed = mediaSyncReportSchema.safeParse(content);
	return parsed.success ? parsed.data : null;
}
