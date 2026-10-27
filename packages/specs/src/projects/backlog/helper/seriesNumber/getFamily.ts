import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";

// Famille d'un numéro : sa partie entière, le numéro de son jeu principal (3.10 → 3)
export function getFamily(seriesNumber: number): number {
	return Math.floor(
		Math.round(seriesNumber * SeriesNumberScaleEnum.THOUSANDTHS) /
			SeriesNumberScaleEnum.THOUSANDTHS,
	);
}
