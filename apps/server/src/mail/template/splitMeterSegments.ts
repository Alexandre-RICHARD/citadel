import { clamp } from "@citadel/common/src/universal/number/clamp.ts";

import type { MeterSegment } from "./meterSegment.type.ts";

/**
 * Une jauge coupée à chaque repère (les seuils du quota) et là où s'arrête la valeur : 250 sur 300, repères 250 et
 * 280 → rempli jusqu'à 250, vide de 250 à 280, vide de 280 à 300. Une jauge sans maximum est pleine
 */
export function splitMeterSegments(
	value: number,
	max: number,
	marks: number[],
): MeterSegment[] {
	if (max <= 0) return [{ from: 0, to: 1, isFilled: true, endsAtMark: false }];

	const filledUpTo = clamp(value, 0, max);
	const innerMarks = marks.filter((mark) => mark > 0 && mark < max);
	const breaks = [...new Set([0, ...innerMarks, filledUpTo, max])].sort(
		(first, second) => first - second,
	);
	return breaks.slice(1).map((end, index) => ({
		from: breaks[index] / max,
		to: end / max,
		isFilled: end <= filledUpTo,
		endsAtMark: innerMarks.includes(end),
	}));
}
