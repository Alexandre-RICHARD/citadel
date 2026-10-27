// Accélère puis freine : progress et résultat entre 0 et 1
export function easeInOutCubic(progress: number): number {
	return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}
