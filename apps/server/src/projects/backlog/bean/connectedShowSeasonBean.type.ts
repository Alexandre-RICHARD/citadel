import type { NasDetailsBean } from "../nas/merge/nasDetailsBean.type.ts";
import type { ShowSeasonBean } from "./showSeasonBean.type.ts";

// Une saison et ses épisodes en mode connecté ; la saison des épisodes spéciaux n'a pas de colonnes du NAS (null)
export type ConnectedShowSeasonBean = Omit<ShowSeasonBean, "episodes"> & {
	nas: NasDetailsBean | null;
	episodes: (ShowSeasonBean["episodes"][number] & {
		nas: NasDetailsBean | null;
	})[];
};
