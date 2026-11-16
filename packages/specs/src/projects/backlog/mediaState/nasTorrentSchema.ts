import { z } from "zod";

import { NasSharingEnum } from "../enum/nasSharing.enum.ts";

/**
 * Un torrent relié au fichier (par son inode, cross-seed compris). `trackerName` : le nom affiché du tracker, tiré de
 * MEDIA_TRACKERS sur le NAS, jamais son adresse ; null pour un tracker que cette variable ne nomme pas. Son état est le
 * meilleur de ses adresses, jamais « aucun torrent »
 */
export const nasTorrentSchema = z.object({
	hash: z.string().min(1),
	name: z.string().min(1),
	trackerName: z.string().min(1).nullable(),
	sharing: z.enum([
		NasSharingEnum.SEEDING,
		NasSharingEnum.TRACKER_UNREACHABLE,
		NasSharingEnum.ERROR,
	]),
});
