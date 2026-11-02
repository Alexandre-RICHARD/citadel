import { clamp } from "@citadel/common/src/universal/number/clamp.ts";

// Le remplissage d'une jauge, en pourcentage entier de 0 à 100, arrondi vers le bas : 100 % seulement quand elle est pleine.
// Une jauge sans maximum est pleine
export function meterPercent(value: number, max: number): number {
	if (max <= 0) return 100;
	return Math.floor(clamp(value / max, 0, 1) * 100);
}
