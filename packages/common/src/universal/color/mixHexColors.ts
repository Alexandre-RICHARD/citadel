import { hexToRgb } from "./hexToRgb.ts";
import { mixRgb } from "./mixRgb.ts";

// Mélange deux couleurs : ratio 0 donne from, 1 donne to. Rend une couleur CSS ("rgb(…)")
export function mixHexColors(from: string, to: string, ratio: number): string {
	const mixed = mixRgb(hexToRgb(from), hexToRgb(to), ratio).map(Math.round);
	return `rgb(${mixed.join(",")})`;
}
