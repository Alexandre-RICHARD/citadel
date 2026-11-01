import type { FileSizeBase } from "./fileSizeBase.type.ts";

const UNITS: Record<FileSizeBase, string[]> = {
	1000: ["o", "ko", "Mo", "Go", "To"],
	1024: ["o", "Kio", "Mio", "Gio", "Tio"],
};
// Au-delà de 3 chiffres, l'unité suivante : « 0,98 Gio » plutôt que « 1 000 Mio »
const UNIT_SWITCH = 1000;

// Deux décimales sous 100, aucune au-dessus ; jamais pour des octets
function decimalsOf(unitIndex: number, value: number): number {
	return unitIndex !== 0 && value < 100 ? 2 : 0;
}

function round(value: number, decimals: number): number {
	return Number(value.toFixed(decimals));
}

// 1 123 000 → « 1,12 Mo » ; 1 536 en base 1024 → « 1,5 Kio »
export function formatFileSize(
	bytes: number,
	base: FileSizeBase = 1000,
): string {
	const units = UNITS[base];
	if (bytes <= 0) return `0 ${units[0]}`;

	const lastUnit = units.length - 1;
	let unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(base)),
		lastUnit,
	);
	let value = bytes / base ** unitIndex;
	// 999 500 o s'arrondit à 1 000 ko : c'est 1 Mo
	if (
		round(value, decimalsOf(unitIndex, value)) >= UNIT_SWITCH &&
		unitIndex < lastUnit
	) {
		unitIndex += 1;
		value = bytes / base ** unitIndex;
	}

	const formatted = value.toLocaleString("fr-FR", {
		maximumFractionDigits: decimalsOf(unitIndex, value),
	});
	return `${formatted} ${units[unitIndex]}`;
}
