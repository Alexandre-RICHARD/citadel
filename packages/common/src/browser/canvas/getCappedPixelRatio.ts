// Densité de pixels de l'écran, plafonnée : au-delà de maxPixelRatio, une image plus fine ne se voit pas et coûte cher
export function getCappedPixelRatio(maxPixelRatio: number): number {
	return Math.min(window.devicePixelRatio || 1, maxPixelRatio);
}
