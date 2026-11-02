// Un morceau de jauge, de `from` à `to` en fraction du maximum
export type MeterSegment = {
	from: number;
	to: number;
	isFilled: boolean;
	// Finit sur un repère : un petit vide le sépare du morceau suivant
	endsAtMark: boolean;
};
