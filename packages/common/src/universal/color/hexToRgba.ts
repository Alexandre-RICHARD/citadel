import { hexToRgb } from "./hexToRgb.ts";

// "#e30613", 0.5 → "rgba(227,6,19,0.5)" : une couleur du thème, rendue translucide dans un canvas
export function hexToRgba(hex: string, alpha: number): string {
	return `rgba(${hexToRgb(hex).join(",")},${alpha})`;
}
