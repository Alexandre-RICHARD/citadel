import type { StatusTone } from "./statusTone.type";

// Une jauge passe à l'orange à 75 %, au rouge à 90 %
export function meterTone(ratio: number): StatusTone {
	if (ratio >= 0.9) return "danger";
	if (ratio >= 0.75) return "warn";
	return "ok";
}
