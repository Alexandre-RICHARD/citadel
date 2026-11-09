import { PlayTimeViewEnum } from "./playTimeView.enum";

// Ce que chaque vue du temps de jeu compte, dit après le temps dans le récap
export const playTimeViewLabels: Readonly<Record<PlayTimeViewEnum, string>> = {
	[PlayTimeViewEnum.TOTAL]: "total",
	[PlayTimeViewEnum.TRACKED]: "relevé",
	[PlayTimeViewEnum.ESTIMATED]: "estimé",
};
