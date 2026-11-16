import type { UserMediaBean } from "./userMediaBean.type.ts";

// Une page du tableau des films et séries, et ce que le résumé et les filtres lisent de tout le backlog
export type UserMediaPageBean = {
	userMedia: UserMediaBean[];
	matchedCount: number;
	movieCount: number;
	showCount: number;
	originalLanguages: string[];
};
