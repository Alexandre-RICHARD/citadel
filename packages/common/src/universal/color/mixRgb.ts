import { interpolate } from "../number/interpolate.ts";
import type { Rgb } from "./rgb.type.ts";

// Mélange canal par canal, sans arrondi : ratio 0 donne from, 1 donne to
export function mixRgb(from: Rgb, to: Rgb, ratio: number): Rgb {
	return [
		interpolate(from[0], to[0], ratio),
		interpolate(from[1], to[1], ratio),
		interpolate(from[2], to[2], ratio),
	];
}
