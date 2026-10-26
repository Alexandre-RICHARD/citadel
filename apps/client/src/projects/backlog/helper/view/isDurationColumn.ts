import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

const DURATION_COLUMNS: BacklogColumnEnum[] = [
	BacklogColumnEnum.TRACKED_PLAY_TIME,
	BacklogColumnEnum.ESTIMATED_PLAY_TIME,
	BacklogColumnEnum.TOTAL_PLAY_TIME,
];

// Colonnes de temps : saisies en heures dans les filtres, comparées en minutes
export function isDurationColumn(column: BacklogColumnEnum): boolean {
	return DURATION_COLUMNS.includes(column);
}
