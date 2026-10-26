import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

// Libellé complet de chaque colonne (cahier des charges, §7)
export const columnLabels: Readonly<Record<BacklogColumnEnum, string>> = {
	[BacklogColumnEnum.THUMBNAIL]: "Miniature",
	[BacklogColumnEnum.NAME]: "Nom",
	[BacklogColumnEnum.SERIES]: "Série",
	[BacklogColumnEnum.SERIES_NUMBER]: "N° dans la série",
	[BacklogColumnEnum.DEVELOPER]: "Développeur",
	[BacklogColumnEnum.PUBLISHER]: "Éditeur",
	[BacklogColumnEnum.RELEASE_DATE]: "Date de sortie",
	[BacklogColumnEnum.ENDING_TYPE]: "Type de fin",
	[BacklogColumnEnum.PLATFORM]: "Plateforme",
	[BacklogColumnEnum.STATUS]: "Statut",
	[BacklogColumnEnum.UP_NEXT]: "À jouer bientôt",
	[BacklogColumnEnum.OWNED]: "Possédé",
	[BacklogColumnEnum.FINISH_DATE]: "Date de fin",
	[BacklogColumnEnum.FINISH_COUNT]: "Fois fini",
	[BacklogColumnEnum.DLC]: "DLC",
	[BacklogColumnEnum.TRACKED_PLAY_TIME]: "Temps relevé",
	[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: "Temps estimé",
	[BacklogColumnEnum.TOTAL_PLAY_TIME]: "Temps total",
	[BacklogColumnEnum.RATING]: "Note",
	[BacklogColumnEnum.COMMENT]: "Commentaire",
	[BacklogColumnEnum.ACTIONS]: "Actions",
};
