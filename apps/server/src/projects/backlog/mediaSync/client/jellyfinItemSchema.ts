import { z } from "zod";

/**
 * Un élément de Jellyfin (film, série, épisode), avec son chemin, ses identifiants (ProviderIds.Tmdb) et ses pistes.
 * RunTimeTicks : la durée, en dix-millionièmes de seconde
 */
export const jellyfinItemSchema = z.object({
	Id: z.string().min(1),
	Name: z.string().nullish(),
	ProductionYear: z.number().int().nullish(),
	Path: z.string().nullish(),
	ProviderIds: z.record(z.string(), z.string().nullish()).nullish(),
	RunTimeTicks: z.number().nullish(),
	SeriesId: z.string().nullish(),
	ParentIndexNumber: z.number().int().nullish(),
	IndexNumber: z.number().int().nullish(),
	MediaSources: z
		.array(
			z.object({
				MediaStreams: z
					.array(
						z.object({
							Type: z.string(),
							Language: z.string().nullish(),
							Width: z.number().nullish(),
							Height: z.number().nullish(),
						}),
					)
					.nullish(),
			}),
		)
		.nullish(),
});
