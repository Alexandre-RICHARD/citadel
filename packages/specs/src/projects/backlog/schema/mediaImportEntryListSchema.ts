import { z } from "zod";

import { bodyIdSchema } from "../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { mediaTypeSchema } from "./mediaTypeSchema.ts";

// Une liste de plusieurs milliers de films tient largement : à 20 fiches par seconde, 10 000 lignes prennent 9 minutes
const MAX_ENTRY_COUNT = 10_000;

// Les lignes d'une liste à importer : identifiant TMDB et type. Un doublon n'est pas une erreur : l'aperçu le signale
export function mediaImportEntryListSchema(label: string) {
	return z
		.array(
			z.object({
				mediaType: mediaTypeSchema,
				tmdbId: bodyIdSchema(`${label} TMDB ID`),
			}),
			{ message: `${label} should be an array` },
		)
		.min(1, { message: `${label} should contain at least one line` })
		.max(MAX_ENTRY_COUNT, {
			message: `${label} should contain at most ${MAX_ENTRY_COUNT} lines`,
		});
}
