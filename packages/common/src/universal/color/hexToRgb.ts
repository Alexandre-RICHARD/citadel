// "#e30613" → [227, 6, 19]. Accepte #rgb, #rrggbb et #rrggbbaa (l'opacité est ignorée)
export function hexToRgb(hex: string): [number, number, number] {
	const digits = hex.replace("#", "");
	const fullDigits =
		digits.length === 3
			? digits
					.split("")
					.map((digit) => digit + digit)
					.join("")
			: digits.slice(0, 6);
	const value = parseInt(fullDigits, 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
