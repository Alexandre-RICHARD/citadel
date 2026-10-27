import { SeriesNumberScaleEnum } from "./seriesNumberScale.enum.ts";

// Un cran de sous-jeu, en millièmes : 100 pour une famille à 1 chiffre (3.1 → 3.2), 10 pour 2 chiffres
export function getSubPartStep(digits: number): number {
	return 10 ** (SeriesNumberScaleEnum.MAX_DECIMALS - digits);
}
