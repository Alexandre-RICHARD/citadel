import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum";

// Le nom de chaque sorte d'écart, aussi valeur de son filtre
export const nasGapKindLabels: Readonly<Record<NasGapKindEnum, string>> = {
	[NasGapKindEnum.DUPLICATE]: "Doublon",
	[NasGapKindEnum.TOOL_MISMATCH]: "Fiche Radarr ou Sonarr différente",
	[NasGapKindEnum.JELLYFIN_MISMATCH]: "Fiche Jellyfin différente ou absente",
	[NasGapKindEnum.UNTRACKED]: "Hors Radarr ou Sonarr",
	[NasGapKindEnum.TMDB_ID_GONE]: "Identifiant TMDB disparu",
};
