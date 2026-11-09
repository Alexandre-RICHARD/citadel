import { PlayTimeViewEnum } from "./playTimeView.enum";

type PlayTimes = {
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
};

// Le temps de jeu que la vue choisie montre, en minutes
export function getPlayTimeMinutes(
	playTimes: PlayTimes,
	view: PlayTimeViewEnum,
): number {
	switch (view) {
		case PlayTimeViewEnum.TRACKED:
			return playTimes.trackedPlayTimeMinutes;
		case PlayTimeViewEnum.ESTIMATED:
			return playTimes.estimatedPlayTimeMinutes;
		default:
			return (
				playTimes.trackedPlayTimeMinutes + playTimes.estimatedPlayTimeMinutes
			);
	}
}
