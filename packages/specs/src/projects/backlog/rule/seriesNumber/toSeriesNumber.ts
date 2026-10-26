import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";

// Famille et rang en millièmes → numéro : (3, 100) → 3.1
export function toSeriesNumber(family: number, subPart: number): number {
	return (
		(family * SeriesNumberScaleEnum.THOUSANDTHS + subPart) /
		SeriesNumberScaleEnum.THOUSANDTHS
	);
}
