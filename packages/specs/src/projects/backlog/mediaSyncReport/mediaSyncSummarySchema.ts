import { z } from "zod";

const countSchema = z.number().int().nonnegative();

/**
 * Les chiffres d'un passage, comparés à ceux du passage précédent sur la console. Morts : le tracker répond mais ne
 * connaît plus le torrent, terminés ou non ; inactifs : leur tracker ne répond pas du tout
 */
export const mediaSyncSummarySchema = z.object({
	torrentCount: countSchema,
	validCount: countSchema,
	deadFinishedCount: countSchema,
	deadUnfinishedCount: countSchema,
	inactiveCount: countSchema,
	unreachableTrackerCount: countSchema,
	withoutMediaCount: countSchema,
	withoutMediaBytes: countSchema,
	neverDownloadedCount: countSchema,
	duplicateCount: countSchema,
	withoutTorrentCount: countSchema,
	crossSeedAddedCount: countSchema,
});
