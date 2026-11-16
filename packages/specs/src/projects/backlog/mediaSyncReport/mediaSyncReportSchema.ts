import { z } from "zod";

import { CrossSeedSearchEnum } from "./crossSeedSearch.enum.ts";
import { MEDIA_SYNC_REPORT_FORMAT_VERSION } from "./mediaSyncReportFormatVersion.ts";
import { mediaSyncSummarySchema } from "./mediaSyncSummarySchema.ts";
import { reportDuplicateSchema } from "./reportDuplicateSchema.ts";
import { reportTorrentSchema } from "./reportTorrentSchema.ts";
import { reportTrackerSchema } from "./reportTrackerSchema.ts";

/**
 * Le rapport d'un passage du job media-sync (§8, étape 5), lu par la console : les torrents et leurs trackers, ce qui
 * n'est pas un média du backlog. Il ne fait qu'informer, rien ne s'y supprime. `previousSummary` : les chiffres du
 * passage d'avant, null au premier. `tags` : l'étiquette tracker-invalide posée sur les nouveaux morts et retirée de
 * ceux qui sont revenus, la seule écriture du job dans qBittorrent
 */
export const mediaSyncReportSchema = z.object({
	formatVersion: z.literal(MEDIA_SYNC_REPORT_FORMAT_VERSION),
	startedAt: z.iso.datetime({ offset: true }),
	finishedAt: z.iso.datetime({ offset: true }),
	crossSeedSearch: z.enum(CrossSeedSearchEnum),
	summary: mediaSyncSummarySchema,
	previousSummary: mediaSyncSummarySchema.nullable(),
	trackers: z.array(reportTrackerSchema),
	deadUnfinished: z.array(reportTorrentSchema),
	deadFinished: z.array(reportTorrentSchema),
	inactive: z.array(reportTorrentSchema),
	withoutMedia: z.array(reportTorrentSchema),
	neverDownloaded: z.array(reportTorrentSchema),
	duplicates: z.array(reportDuplicateSchema),
	crossSeedAdded: z.array(reportTorrentSchema),
	tags: z.object({
		added: z.number().int().nonnegative(),
		removed: z.number().int().nonnegative(),
	}),
});
