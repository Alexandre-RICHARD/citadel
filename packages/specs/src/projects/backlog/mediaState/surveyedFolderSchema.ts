import { z } from "zod";

/**
 * Le dossier d'un film ou d'une série sous medias/ (« Titre (année) »), tel que le job l'a lu. L'instance locale s'en sert
 * pour relier au backlog un média qu'aucun outil ne relie au bon identifiant TMDB : par son titre et son année (§4)
 */
export const surveyedFolderSchema = z.object({
	path: z.string().min(1),
	title: z.string().min(1),
	// null : le nom du dossier ne porte pas d'année
	year: z.number().int().nullable(),
});
