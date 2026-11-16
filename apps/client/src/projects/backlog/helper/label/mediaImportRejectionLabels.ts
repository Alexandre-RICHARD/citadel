import { MediaImportRejectionEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportRejection.enum";

// Pourquoi une ligne de la liste importée n'est pas reprise
export const mediaImportRejectionLabels: Readonly<
	Record<MediaImportRejectionEnum, string>
> = {
	[MediaImportRejectionEnum.TMDB_NOT_FOUND]:
		"Inconnu de TMDB pour ce type (un film donné comme série ?)",
	[MediaImportRejectionEnum.DUPLICATE]: "Déjà plus haut dans la liste",
	[MediaImportRejectionEnum.ALREADY_IN_BACKLOG]: "Déjà dans le backlog",
};
