import { hexToRgb } from "./hexToRgb.ts";

// Mélange deux couleurs : ratio 0 donne from, 1 donne to. Rend une couleur CSS ("rgb(…)")
export function mixHexColors(from: string, to: string, ratio: number): string {
	const fromRgb = hexToRgb(from);
	const toRgb = hexToRgb(to);
	const mixed = fromRgb.map((channel, index) =>
		Math.round(channel + (toRgb[index] - channel) * ratio),
	);
	return `rgb(${mixed.join(",")})`;
}
