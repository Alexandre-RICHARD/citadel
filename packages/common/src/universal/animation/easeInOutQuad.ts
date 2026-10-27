// Accélère puis freine, plus doucement qu'easeInOutCubic : progress et résultat entre 0 et 1
export function easeInOutQuad(progress: number): number {
	return progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;
}
