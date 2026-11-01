import { padWithZeros } from "@citadel/common/src/universal/number/padWithZeros";

const SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;

// Le temps avant de pouvoir réessayer, arrondi à la seconde supérieure : « 12 min 05 s », « 45 s »
export function formatWaitDelay(delayMs: number): string {
	const totalSeconds = Math.max(0, Math.ceil(delayMs / SECOND_MS));
	const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
	const seconds = totalSeconds % SECONDS_PER_MINUTE;
	return minutes === 0
		? `${seconds} s`
		: `${minutes} min ${padWithZeros(seconds)} s`;
}
