// Un dégradé aux couleurs réparties à intervalles égaux : 90, [a, b, c] → a 0 %, b 50 %, c 100 %
export function linearGradient(angle: number, colors: string[]): string {
	const lastIndex = Math.max(colors.length - 1, 1);
	const stops = colors.map(
		(color, index) => `${color} ${Math.round((index / lastIndex) * 100)}%`,
	);
	return `linear-gradient(${angle}deg,${stops.join(",")})`;
}
