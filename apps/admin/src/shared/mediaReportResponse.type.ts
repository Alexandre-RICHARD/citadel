import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";

// Le dernier rapport du job media-sync ; null : aucun passage encore, ou un rapport d'une autre version du format
export type MediaReportResponse = { report: MediaSyncReport | null };
