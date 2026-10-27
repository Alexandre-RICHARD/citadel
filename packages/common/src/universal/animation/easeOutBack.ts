// Dépasse un peu la cible avant de s'y poser, comme un objet qui saute en place
export function easeOutBack(progress: number): number {
	const overshoot = 1.70158;
	return (
		1 + (overshoot + 1) * (progress - 1) ** 3 + overshoot * (progress - 1) ** 2
	);
}
