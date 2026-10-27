import { padWithZeros } from "../number/padWithZeros.ts";

type AcceptedFormat = "HMS" | "HHMMSS";

const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * 60;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60;

// Un temps négatif (échéance dépassée) s'affiche à zéro ; un temps infini ou NaN (vitesse nulle…) donne une chaîne vide
export function writeCountdown(
	timeInMilliseconds: number,
	format: AcceptedFormat,
): string {
	if (!Number.isFinite(timeInMilliseconds)) return "";
	const remainingTime = Math.max(timeInMilliseconds, 0);
	const hours = Math.trunc(remainingTime / MILLISECONDS_PER_HOUR);
	const minutes = Math.trunc(
		(remainingTime % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE,
	);
	const seconds = Math.trunc(
		(remainingTime % MILLISECONDS_PER_MINUTE) / MILLISECONDS_PER_SECOND,
	);
	switch (format) {
		case "HMS":
			return `${hours}H ${minutes}M ${seconds}S`;
		case "HHMMSS":
			return `${padWithZeros(hours)}H ${padWithZeros(minutes)}M ${padWithZeros(seconds)}S`;
		default:
			return "";
	}
}
