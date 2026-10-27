// Le logo hexagonal : six barres posées sur les côtés d'un hexagone, chacune dépasse d'un sommet et finit en pointe.
// Coordonnées dans le viewBox du logo (-10.5 -10.5 21 21), calculées une fois
const SIDE = 7;
const BAR_WIDTH = 1.45;
const BAR_LENGTH = SIDE + 2.5;

function format(value: number): string {
	return value.toFixed(3);
}

const corners = Array.from({ length: 6 }, (_, index): [number, number] => [
	SIDE * Math.cos((Math.PI / 3) * index),
	SIDE * Math.sin((Math.PI / 3) * index),
]);

// La barre, à plat, avant d'être tournée sur son côté
const barPoints = [
	[0, -BAR_WIDTH / 2],
	[BAR_LENGTH, -BAR_WIDTH / 2],
	[BAR_LENGTH + BAR_WIDTH / 2, 0],
	[BAR_LENGTH, BAR_WIDTH / 2],
	[0, BAR_WIDTH / 2],
]
	.map((point) => point.map(format).join(","))
	.join(" ");

export const logoBars = corners.map(([x, y], index) => {
	const [nextX, nextY] = corners[(index + 1) % 6];
	const angle = (Math.atan2(nextY - y, nextX - x) * 180) / Math.PI;
	return {
		transform: `translate(${format(x)} ${format(y)}) rotate(${angle.toFixed(2)})`,
		points: barPoints,
	};
});
