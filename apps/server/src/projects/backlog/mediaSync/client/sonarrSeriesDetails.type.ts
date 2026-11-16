import type { SonarrEpisode } from "./sonarrEpisode.type.ts";
import type { SonarrEpisodeFile } from "./sonarrEpisodeFile.type.ts";
import type { SonarrSeries } from "./sonarrSeries.type.ts";

// Une série de Sonarr, avec ses épisodes et ses fichiers : Sonarr ne les donne que série par série
export type SonarrSeriesDetails = {
	series: SonarrSeries;
	episodes: SonarrEpisode[];
	files: SonarrEpisodeFile[];
};
