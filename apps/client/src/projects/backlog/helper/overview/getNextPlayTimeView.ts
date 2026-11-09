import { PlayTimeViewEnum } from "./playTimeView.enum";

// Chaque clic sur le temps de jeu passe au suivant : total → relevé → estimé, puis revient au total
const nextViews: Readonly<Record<PlayTimeViewEnum, PlayTimeViewEnum>> = {
	[PlayTimeViewEnum.TOTAL]: PlayTimeViewEnum.TRACKED,
	[PlayTimeViewEnum.TRACKED]: PlayTimeViewEnum.ESTIMATED,
	[PlayTimeViewEnum.ESTIMATED]: PlayTimeViewEnum.TOTAL,
};

export function getNextPlayTimeView(view: PlayTimeViewEnum): PlayTimeViewEnum {
	return nextViews[view];
}
