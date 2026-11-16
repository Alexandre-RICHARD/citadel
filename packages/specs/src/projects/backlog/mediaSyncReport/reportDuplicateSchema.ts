import { z } from "zod";

import { NasQualityEnum } from "../enum/nasQuality.enum.ts";

// Un film ou un épisode qui a plusieurs fichiers distincts (d'inodes différents), chacun avec ses torrents
export const reportDuplicateSchema = z.object({
	label: z.string().min(1),
	files: z
		.array(
			z.object({
				path: z.string().min(1),
				quality: z.enum(NasQualityEnum).nullable(),
				sizeBytes: z.number().int().nonnegative(),
				torrentCount: z.number().int().nonnegative(),
			}),
		)
		.min(2),
});
