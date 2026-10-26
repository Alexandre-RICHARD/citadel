import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { SeriesNumberScaleEnum } from "../rule/seriesNumber/seriesNumberScale.enum.ts";

const MIN_SERIES_NUMBER = 1;

// Le nombre ne garde rien au-delà du millième : 3.1 × 1000 vaut 3100, aux erreurs d'arrondi près
function hasAtMostThreeDecimals(seriesNumber: number): boolean {
	const thousandths = seriesNumber * SeriesNumberScaleEnum.THOUSANDTHS;
	return Math.abs(thousandths - Math.round(thousandths)) < 1e-6;
}

// Numéro dans une série : à partir de 1, 3 décimales au plus (sous-jeux)
export function seriesNumberSchema(label: string) {
	return z
		.number({
			message: `${label} should be a JSON number, not text (e.g. 3.1, not "3.1")`,
		})
		.min(MIN_SERIES_NUMBER, {
			message: `${label} should be at least ${MIN_SERIES_NUMBER}`,
		})
		.max(SeriesNumberScaleEnum.MAX, {
			message: `${label} should be at most ${SeriesNumberScaleEnum.MAX}`,
		})
		.refine(hasAtMostThreeDecimals, {
			message: `${label} should have at most ${SeriesNumberScaleEnum.MAX_DECIMALS} decimals`,
			params: {
				code: ValidationIssueCodeEnum.TOO_MANY_DECIMALS,
				limit: SeriesNumberScaleEnum.MAX_DECIMALS,
			},
		});
}
