import { z } from "zod";

import { MEDIA_STATE_FORMAT_VERSION } from "./mediaStateFormatVersion.ts";
import { surveyedMovieSchema } from "./surveyedMovieSchema.ts";
import { surveyedShowSchema } from "./surveyedShowSchema.ts";
import { unlinkedMediaSchema } from "./unlinkedMediaSchema.ts";

/**
 * Le relevé d'un passage du job media-sync (survey/current.json), lu par l'instance locale et fusionné avec le backlog
 * par identifiant TMDB. Il couvre tout ce que le NAS contient, dans un backlog ou non : ce qui reste après la fusion, ce
 * sont les médias oubliés. `jellyfinServerId` : l'identifiant du serveur Jellyfin, que demandent ses adresses d'élément
 */
export const mediaSurveySchema = z.object({
	formatVersion: z.literal(MEDIA_STATE_FORMAT_VERSION),
	surveyedAt: z.iso.datetime({ offset: true }),
	jellyfinServerId: z.string().min(1).nullable(),
	movies: z.array(surveyedMovieSchema),
	shows: z.array(surveyedShowSchema),
	unlinked: z.array(unlinkedMediaSchema),
});
