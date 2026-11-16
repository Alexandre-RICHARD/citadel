import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";

// Libellé complet de chaque colonne du tableau des films et séries
export const mediaColumnLabels: Readonly<Record<MediaColumnEnum, string>> = {
	[MediaColumnEnum.THUMBNAIL]: "Miniature",
	[MediaColumnEnum.TITLE]: "Titre",
	[MediaColumnEnum.MEDIA_TYPE]: "Type",
	[MediaColumnEnum.ORIGINAL_LANGUAGE]: "Langue originale",
	[MediaColumnEnum.SAGA]: "Saga",
	[MediaColumnEnum.SAGA_NUMBER]: "N° dans la saga",
	[MediaColumnEnum.RELEASE_DATE]: "Sortie",
	[MediaColumnEnum.RUNTIME]: "Durée",
	[MediaColumnEnum.IN_PROGRESS]: "En cours",
	[MediaColumnEnum.COMMENT]: "Commentaire",
	[MediaColumnEnum.WATCHED]: "Vu",
	[MediaColumnEnum.UP_NEXT]: "À voir bientôt",
	[MediaColumnEnum.TMDB_ID]: "Identifiant TMDB",
	[MediaColumnEnum.ACTIONS]: "Actions",
};
