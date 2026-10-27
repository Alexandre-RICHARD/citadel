// Départ et arrivée en douceur, en sinusoïde ; progress ramené entre 0 et 1
export function easeInOutSine(progress: number): number {
	if (progress <= 0) return 0;
	if (progress >= 1) return 1;
	return 0.5 - 0.5 * Math.cos(Math.PI * progress);
}
