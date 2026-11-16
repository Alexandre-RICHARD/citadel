import { z } from "zod";

import { NasGapKindEnum } from "../enum/nasGapKind.enum.ts";
import { NasToolEnum } from "../enum/nasTool.enum.ts";

const tmdbIdSchema = z.number().int().positive();

// Un écart trouvé par le job (§5). Un identifiant TMDB cité devient un lien vers sa fiche
export const nasGapSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal(NasGapKindEnum.DUPLICATE),
		fileCount: z.number().int().min(2),
	}),
	z.object({
		kind: z.literal(NasGapKindEnum.TOOL_MISMATCH),
		tool: z.enum(NasToolEnum),
		tmdbId: tmdbIdSchema,
	}),
	// null : Jellyfin ne relie le fichier à aucun identifiant
	z.object({
		kind: z.literal(NasGapKindEnum.JELLYFIN_MISMATCH),
		tmdbId: tmdbIdSchema.nullable(),
	}),
	z.object({ kind: z.literal(NasGapKindEnum.UNTRACKED) }),
	z.object({ kind: z.literal(NasGapKindEnum.TMDB_ID_GONE) }),
]);
