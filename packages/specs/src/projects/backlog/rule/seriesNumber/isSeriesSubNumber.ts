import { getSubPart } from "./getSubPart.ts";

// Un numéro à décimales est un sous-jeu
export function isSeriesSubNumber(seriesNumber: number): boolean {
	return getSubPart(seriesNumber) > 0;
}
