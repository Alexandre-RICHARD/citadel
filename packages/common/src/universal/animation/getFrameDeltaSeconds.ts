// Au-delà, l'animation ne rattrape pas le temps perdu (onglet en arrière-plan, ralentissement) : elle reprend où elle était
const MAX_FRAME_DELTA_SECONDS = 0.05;

// Secondes écoulées depuis l'image précédente, instants en millisecondes (ceux de requestAnimationFrame)
export function getFrameDeltaSeconds(
	now: number,
	previousFrameAt: number,
): number {
	return Math.min(MAX_FRAME_DELTA_SECONDS, (now - previousFrameAt) / 1000);
}
