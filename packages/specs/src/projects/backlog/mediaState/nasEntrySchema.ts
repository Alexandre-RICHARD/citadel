import { z } from "zod";

import { NasStorageEnum } from "../enum/nasStorage.enum.ts";
import { NasToolEnum } from "../enum/nasTool.enum.ts";
import { nasFileSchema } from "./nasFileSchema.ts";
import { nasGapSchema } from "./nasGapSchema.ts";
import { nasTorrentSchema } from "./nasTorrentSchema.ts";

/**
 * Ce que le job sait d'un film ou d'un épisode. `file` : le fichier principal (le plus gros, quand il y en a plusieurs) ;
 * `fileCount` : les fichiers distincts trouvés, plus d'un faisant l'écart « Doublon ». `trackedBy` : l'outil qui le
 * suit, null quand aucun ne le suit. `jellyfinItemId` : son élément dans Jellyfin, pour « Ouvrir dans Jellyfin »
 */
export const nasEntrySchema = z.object({
	storage: z.enum(NasStorageEnum),
	trackedBy: z.enum(NasToolEnum).nullable(),
	file: nasFileSchema.nullable(),
	fileCount: z.number().int().nonnegative(),
	jellyfinItemId: z.string().min(1).nullable(),
	torrents: z.array(nasTorrentSchema),
	gaps: z.array(nasGapSchema),
});
