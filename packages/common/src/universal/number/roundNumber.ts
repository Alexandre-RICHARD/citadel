// Décale la virgule de `places` rangs en passant par l'écriture exponentielle,
// pour éviter les erreurs de multiplication flottante (1.1 * 100 = 110.00000000000001)
function shiftDecimalPoint(number: number, places: number): number {
	const [mantissa, exponent = "0"] = String(number).split("e");
	return Number(`${mantissa}e${Number(exponent) + places}`);
}

// Sans roundType, arrondit au plus proche, les moitiés en s'éloignant de zéro (1.005 → 1.01, -2.5 → -3)
export function roundNumber(
	number: number,
	decimal: number,
	roundType?: "ceil" | "floor",
): number {
	if (!Number.isFinite(number)) return number;

	const shiftedNumber = shiftDecimalPoint(number, decimal);
	const roundedShiftedNumber = roundType
		? Math[roundType](shiftedNumber)
		: Math.sign(shiftedNumber) * Math.round(Math.abs(shiftedNumber));

	// + 0 transforme -0 en 0
	return shiftDecimalPoint(roundedShiftedNumber, -decimal) + 0;
}
