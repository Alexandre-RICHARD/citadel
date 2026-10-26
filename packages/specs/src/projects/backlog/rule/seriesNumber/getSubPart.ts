import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";

// Rang de sous-jeu, en millièmes : 0 pour un principal, 100 pour 3.1, 10 pour 3.01
export function getSubPart(seriesNumber: number): number {
	return (
		Math.round(seriesNumber * SeriesNumberScaleEnum.THOUSANDTHS) %
		SeriesNumberScaleEnum.THOUSANDTHS
	);
}
