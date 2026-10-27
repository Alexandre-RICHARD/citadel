// Le mouvement d'un blob : il monte et descend lentement, dérive un peu en largeur et respire.
// Positions en fraction de l'écran, vitesses en radians par seconde
export type LavaBall = {
	baseX: number;
	driftX: number;
	speedX: number;
	phaseX: number;
	speedY: number;
	phaseY: number;
	amplitudeY: number;
	radius: number;
	breathSpeed: number;
	breathPhase: number;
	// Laquelle des quatre couleurs de décoration
	colorIndex: number;
};
