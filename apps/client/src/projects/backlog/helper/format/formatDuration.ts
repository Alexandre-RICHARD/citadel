import { splitMinutesIntoHours } from "@citadel/common/src/universal/date/splitMinutesIntoHours";
import { padWithZeros } from "@citadel/common/src/universal/number/padWithZeros";

// Minutes → « 12 h 30 », heures toujours écrites : les temps de jeu se lisent en heures
export function formatDuration(totalMinutes: number): string {
	const { hours, minutes } = splitMinutesIntoHours(totalMinutes);
	return `${hours} h ${padWithZeros(minutes)}`;
}
