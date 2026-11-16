import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import type { CrossSeedSearchEnum } from "@citadel/specs/src/projects/backlog/mediaSyncReport/crossSeedSearch.enum.ts";
import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";
import type { ReportDuplicate } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportDuplicate.type.ts";

import type { DiskIndex } from "../disk/diskIndex.type.ts";
import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";

// Ce que le rapport d'un passage résume ; `previous` : le rapport du passage d'avant, null au premier
export type ReportInputs = {
	startedAt: string;
	finishedAt: string;
	crossSeedSearch: CrossSeedSearchEnum;
	torrents: readonly SurveyedTorrent[];
	disk: Pick<DiskIndex, "pathsByInode">;
	mediasRoot: string;
	queuedHashes: ReadonlySet<string>;
	survey: Pick<MediaSurvey, "movies" | "shows">;
	duplicates: ReportDuplicate[];
	tags: { added: number; removed: number };
	previous: MediaSyncReport | null;
};
