import { z } from "zod";

/**
 * Un torrent cité dans le rapport. `trackerName` : le nom de MEDIA_TRACKERS, sinon le seul nom d'hôte du tracker (jamais
 * son adresse, qui contient la clé personnelle) ; null sans tracker. `message` : ce que le tracker a répondu, pour un
 * torrent mort
 */
export const reportTorrentSchema = z.object({
	hash: z.string().min(1),
	name: z.string().min(1),
	trackerName: z.string().min(1).nullable(),
	category: z.string().min(1).nullable(),
	message: z.string().min(1).nullable(),
	progressPercent: z.number().min(0).max(100),
	sizeBytes: z.number().int().nonnegative(),
	addedAt: z.iso.datetime({ offset: true }),
});
